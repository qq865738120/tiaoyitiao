#!/usr/bin/env python3
"""Deterministic Cocos 3.8 sprite post-processing. Creative generation stays in Game Agent."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
from collections import deque
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

REQUEST_SCHEMA = "game-agent.cocos-2dsprite-process/v1"
REPORT_SCHEMA = "game-agent.cocos-2dsprite-report/v1"
MAX_INPUT_BYTES = 32 * 1024 * 1024
MAX_PIXELS = 16_777_216
MAX_FRAMES = 128
MAX_OUTPUT_BYTES = 64 * 1024 * 1024
ALPHA_EMPTY_THRESHOLD = 8
MAX_ADAPTIVE_CHROMA_TOLERANCE = 72.0
MIN_ADAPTIVE_CHROMA_TOLERANCE = 4.0
MIN_CHROMA_BOUNDARY_COVERAGE = 0.98
MIN_CHROMA_CLUSTER_SHARE = 0.10
MAX_CHROMA_BOUNDARY_P995 = 24.0
CHROMA_DESPILL_EDGE_RADIUS = 6
CHROMA_DESPILL_COSINE_MIN = 0.75
CHROMA_DESPILL_DISTANCE_RANGE = 96.0
DEFAULT_CHROMA_ALPHA_CUTOFF = 64
DEFAULT_PIXEL_PALETTE_COLORS = 64
DEFAULT_PIXEL_ALPHA_THRESHOLD = 128
DEFAULT_SOURCE_GRID_FIDELITY_MIN = 0.5
DEFAULT_SOURCE_GRID_COLOR_TOLERANCE = 16
DEFAULT_TIGHT_MARGIN_PIXELS = 1
DEFAULT_SAFE_MARGIN_RATIO = 0.04
MAX_LAYOUT_ASPECT_RATIO_RELATIVE_DELTA = 0.05
RENDER_REASON_CODES = {
    "explicit-user",
    "reference-pixel-art",
    "context-pixel-art",
    "default-raster",
    "legacy-explicit-pixel-config",
    "explicit-request",
}
LAYOUT_MARGIN_MODES = {"tight", "safe"}
LAYOUT_REASON_CODES = {
    "explicit-user",
    "ui-tight",
    "icon-safe",
    "animation-safe",
    "default-safe",
}


def fail(code: str, **details: Any) -> None:
    raise RuntimeError(json.dumps({"code": code, "details": details}, sort_keys=True))


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        fail("JSON_OBJECT_REQUIRED")
    return value


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + f".tmp-{os.getpid()}")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inside(root: Path, candidate: Path, must_exist: bool = True) -> Path:
    root_real = root.resolve(strict=True)
    value = candidate.resolve(strict=must_exist)
    if value != root_real and root_real not in value.parents:
        fail("PATH_OUTSIDE_RUN", path=str(candidate))
    if must_exist and value.is_symlink():
        fail("SYMLINK_REJECTED", path=str(candidate))
    return value


def dilate_mask(mask: np.ndarray, radius: int) -> np.ndarray:
    result = mask.copy()
    for _ in range(radius):
        expanded = result.copy()
        expanded[1:, :] |= result[:-1, :]
        expanded[:-1, :] |= result[1:, :]
        expanded[:, 1:] |= result[:, :-1]
        expanded[:, :-1] |= result[:, 1:]
        result = expanded
    return result


def boundary_connected_mask(candidate: np.ndarray) -> np.ndarray:
    """返回候选颜色中与图片任一外边界四向连通的像素。"""
    height, width = candidate.shape
    connected = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if candidate[0, x]: queue.append((0, x))
        if candidate[height - 1, x]: queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0]: queue.append((y, 0))
        if candidate[y, width - 1]: queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if connected[y, x] or not candidate[y, x]:
            continue
        connected[y, x] = True
        if y: queue.append((y - 1, x))
        if y + 1 < height: queue.append((y + 1, x))
        if x: queue.append((y, x - 1))
        if x + 1 < width: queue.append((y, x + 1))
    return connected


def boundary_colour_evidence(boundary: np.ndarray) -> dict[str, Any]:
    """检测外边界是否包含两个彼此分离且均有显著占比的颜色簇。"""
    if boundary.shape[0] < 2:
        return {"multimodal": False, "clusterShares": [1.0], "clusterDistance": 0.0, "withinClusterP95": 0.0}
    first = np.median(boundary, axis=0)
    first_distances = np.sqrt(np.sum((boundary - first) ** 2, axis=1))
    second = boundary[int(np.argmax(first_distances))].copy()
    centres = np.stack((first, second)).astype(np.float32)
    assignments = np.zeros(boundary.shape[0], dtype=np.int8)
    for _ in range(8):
        distances = np.sqrt(np.sum((boundary[:, None, :] - centres[None, :, :]) ** 2, axis=2))
        updated_assignments = np.argmin(distances, axis=1).astype(np.int8)
        if np.array_equal(updated_assignments, assignments):
            break
        assignments = updated_assignments
        for index in range(2):
            members = boundary[assignments == index]
            if members.size:
                centres[index] = np.median(members, axis=0)
    shares = [float((assignments == index).mean()) for index in range(2)]
    within: list[float] = []
    for index in range(2):
        members = boundary[assignments == index]
        if not members.size:
            within.append(0.0)
            continue
        member_distances = np.sqrt(np.sum((members - centres[index]) ** 2, axis=1))
        within.append(float(np.percentile(member_distances, 95)))
    separation = float(np.sqrt(np.sum((centres[0] - centres[1]) ** 2)))
    multimodal = min(shares) >= MIN_CHROMA_CLUSTER_SHARE and separation > max(16.0, 3.0 * max(within))
    return {
        "multimodal": multimodal,
        "clusterShares": [round(value, 6) for value in shares],
        "clusterDistance": separation,
        "withinClusterP95": max(within),
    }


def bounded_otsu_threshold(distances: np.ndarray, lower_bound: float, upper_bound: float) -> float:
    """在安全色差预算内，用全图距离直方图寻找背景主簇的结束位置。"""
    upper = int(math.floor(upper_bound))
    histogram, _ = np.histogram(distances, bins=np.arange(upper + 2, dtype=np.float32))
    nonzero = np.flatnonzero(histogram)
    if nonzero.size <= 1:
        return lower_bound
    values = np.arange(histogram.size, dtype=np.float64)
    total_weight = float(histogram.sum())
    total_sum = float(np.dot(histogram, values))
    background_weight = 0.0
    background_sum = 0.0
    best_variance = -1.0
    best_threshold = lower_bound
    for threshold in range(upper):
        background_weight += float(histogram[threshold])
        background_sum += float(histogram[threshold] * threshold)
        foreground_weight = total_weight - background_weight
        if background_weight <= 0.0 or foreground_weight <= 0.0:
            continue
        background_mean = background_sum / background_weight
        foreground_mean = (total_sum - background_sum) / foreground_weight
        between_variance = background_weight * foreground_weight * (background_mean - foreground_mean) ** 2
        if between_variance > best_variance:
            best_variance = between_variance
            best_threshold = float(threshold + 1)
    return max(lower_bound, min(upper_bound, best_threshold))


def remove_image_chroma(image: Image.Image, key: list[int], tolerance: float, feather: float) -> tuple[Image.Image, dict[str, Any]]:
    """按已证明的背景颜色范围清除全图像素，包括与外边界不连通的封闭背景。"""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[:, :, :3].astype(np.float32)
    key_rgb = np.asarray(key, dtype=np.float32)
    distance = np.sqrt(np.sum((rgb - key_rgb) ** 2, axis=2))
    candidate = distance <= tolerance
    connected = boundary_connected_mask(candidate)
    if not connected.any():
        fail("CHROMA_NO_BOUNDARY_EVIDENCE")
    # Once the colour family is proven on the outer boundary, the same key
    # pixels enclosed by legs, arms or equipment are background holes too.
    # The generation contract forbids using the key colour in the subject.
    proven_background = candidate
    alpha = rgba[:, :, 3].astype(np.float32)
    alpha[proven_background] = 0.0
    # 只羽化与已证明背景相邻的窄边，避免误删主体内部的相似颜色。
    soft_band = dilate_mask(proven_background, 3) & (~proven_background)
    soft = soft_band & (distance < tolerance + feather)
    if soft.any():
        weight = np.clip((distance[soft] - tolerance) / max(feather, 1.0), 0.0, 1.0)
        alpha[soft] *= weight
        # Decontaminate edge RGB by reducing the key channel contribution.
        edge = rgb[soft]
        edge = np.clip((edge - key_rgb * (1.0 - weight[:, None])) / np.maximum(weight[:, None], 0.08), 0, 255)
        rgba[:, :, :3][soft] = edge.astype(np.uint8)
    rgba[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), {
        "method": "image-wide-chroma-v2",
        "key": key,
        "tolerance": tolerance,
        "feather": feather,
        "removedPixels": int(proven_background.sum()),
        "boundaryConnectedPixels": int(connected.sum()),
        "enclosedKeyPixelsRemoved": int(proven_background.sum() - connected.sum()),
        "softPixels": int(soft.sum()),
    }


def infer_chroma_from_image(image: Image.Image, expected_key: list[int], tolerance_budget: float, maximum_tolerance: float) -> tuple[list[int], float, dict[str, Any]]:
    """用边界锁定背景簇，再扫描全图推断真实背景中心色与颜色范围。"""
    rgb = np.asarray(image.convert("RGBA"), dtype=np.uint8)[:, :, :3].astype(np.float32)
    boundary = np.concatenate((rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]), axis=0)
    actual = np.median(boundary, axis=0)
    expected = np.asarray(expected_key, dtype=np.float32)
    expected_distance = float(np.sqrt(np.sum((actual - expected) ** 2)))
    cluster_evidence = boundary_colour_evidence(boundary)
    if cluster_evidence["multimodal"]:
        fail("CHROMA_BOUNDARY_MULTIMODAL", evidence=cluster_evidence)
    boundary_distances = np.sqrt(np.sum((boundary - actual) ** 2, axis=1))
    boundary_p995 = float(np.percentile(boundary_distances, 99.5))
    if boundary_p995 > MAX_CHROMA_BOUNDARY_P995:
        fail(
            "CHROMA_BOUNDARY_VARIANCE_TOO_HIGH",
            boundaryDistanceP995=boundary_p995,
            maximumBoundaryP995=MAX_CHROMA_BOUNDARY_P995,
        )
    boundary_floor = max(MIN_ADAPTIVE_CHROMA_TOLERANCE, boundary_p995 + 4.0)
    if boundary_floor > tolerance_budget:
        fail(
            "CHROMA_BOUNDARY_VARIANCE_TOO_HIGH",
            boundaryDistanceP995=boundary_p995,
            requiredTolerance=boundary_floor,
            toleranceBudget=tolerance_budget,
        )
    image_distances = np.sqrt(np.sum((rgb - actual) ** 2, axis=2))
    histogram_threshold = bounded_otsu_threshold(image_distances, boundary_floor, maximum_tolerance)
    budget_connected = boundary_connected_mask(image_distances <= tolerance_budget)
    if not budget_connected.any():
        fail("CHROMA_NO_BOUNDARY_EVIDENCE")
    connected_distances = image_distances[budget_connected]
    connected_p999 = float(np.percentile(connected_distances, 99.9))
    connected_threshold = min(tolerance_budget, connected_p999 + 2.0)
    tolerance = min(tolerance_budget, max(histogram_threshold, connected_threshold))
    coverage = float((boundary_distances <= tolerance).sum()) / int(boundary_distances.size)
    if coverage < MIN_CHROMA_BOUNDARY_COVERAGE:
        fail("CHROMA_BOUNDARY_VARIANCE_TOO_HIGH", coverage=coverage, tolerance=tolerance)
    global_background_ratio = float((image_distances <= tolerance).mean())
    if global_background_ratio <= 0.0 or global_background_ratio >= 0.98:
        fail("CHROMA_GLOBAL_RANGE_INVALID", backgroundRatio=global_background_ratio, tolerance=tolerance)
    return [int(round(value)) for value in actual], tolerance, {
        "expectedKey": expected_key,
        "inferredKey": [int(round(value)) for value in actual],
        "actualBoundaryKey": [int(round(value)) for value in actual],
        "expectedKeyDistance": expected_distance,
        "boundaryDistanceP995": boundary_p995,
        "boundaryCoverage": coverage,
        "globalDistanceThreshold": histogram_threshold,
        "globalBackgroundRatio": global_background_ratio,
        "connectedDistanceP999": connected_p999,
        "connectedBackgroundRatioAtBudget": float(budget_connected.mean()),
        "toleranceBudget": tolerance_budget,
        "boundaryClusters": cluster_evidence,
    }


def chroma_residual_evidence(image: Image.Image, key: list[int], tolerance: float, feather: float) -> dict[str, int]:
    """在实际 Alpha 与去色边完成后统计仍接近推断背景色的可见像素。"""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    rgb = rgba[:, :, :3].astype(np.float32)
    key_rgb = np.asarray(key, dtype=np.float32)
    distance = np.sqrt(np.sum((rgb - key_rgb) ** 2, axis=2))
    visible = rgba[:, :, 3] > ALPHA_EMPTY_THRESHOLD
    return {
        "residualKeyPixels": int((visible & (distance <= tolerance)).sum()),
        "residualFeatherPixels": int((visible & (distance > tolerance) & (distance <= tolerance + feather)).sum()),
    }


def despill_inferred_chroma(image: Image.Image, key: list[int], tolerance: float) -> tuple[Image.Image, int]:
    """只在透明边缘邻域削弱与实际背景色同方向的扩散污染。"""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[:, :, :3].astype(np.float32)
    alpha = rgba[:, :, 3].astype(np.float32)
    visible = alpha > ALPHA_EMPTY_THRESHOLD
    edge_band = dilate_mask(alpha <= ALPHA_EMPTY_THRESHOLD, CHROMA_DESPILL_EDGE_RADIUS) & visible
    key_rgb = np.asarray(key, dtype=np.float32)
    key_chroma = key_rgb - float(key_rgb.mean())
    key_chroma_norm = float(np.linalg.norm(key_chroma))
    if key_chroma_norm < 1.0 or not edge_band.any():
        return image, 0
    pixel_chroma = rgb - rgb.mean(axis=2, keepdims=True)
    pixel_chroma_norm = np.sqrt(np.sum(pixel_chroma ** 2, axis=2))
    similarity = np.sum(pixel_chroma * key_chroma, axis=2) / np.maximum(
        pixel_chroma_norm * key_chroma_norm,
        1e-6,
    )
    distance = np.sqrt(np.sum((rgb - key_rgb) ** 2, axis=2))
    polluted = (
        edge_band
        & (similarity >= CHROMA_DESPILL_COSINE_MIN)
        & (distance <= tolerance + CHROMA_DESPILL_DISTANCE_RANGE)
    )
    if not polluted.any():
        return image, 0
    weight = np.clip(
        (distance[polluted] - tolerance) / CHROMA_DESPILL_DISTANCE_RANGE,
        0.05,
        1.0,
    )
    corrected = np.clip(
        (rgb[polluted] - key_rgb * (1.0 - weight[:, None])) / np.maximum(weight[:, None], 0.08),
        0,
        255,
    )
    rgb[polluted] = corrected
    alpha[polluted] *= weight
    rgba[:, :, :3] = rgb.astype(np.uint8)
    rgba[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), int(polluted.sum())


def transparency_evidence(image: Image.Image, method: str) -> dict[str, Any]:
    alpha = np.asarray(image.getchannel("A"), dtype=np.uint8)
    total = int(alpha.size)
    transparent = int((alpha <= ALPHA_EMPTY_THRESHOLD).sum())
    opaque = int((alpha > ALPHA_EMPTY_THRESHOLD).sum())
    edge = np.concatenate((alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]))
    return {
        "method": method,
        "transparentPixels": transparent,
        "opaquePixels": opaque,
        "transparentRatio": transparent / total,
        "edgeTransparentRatio": float((edge <= ALPHA_EMPTY_THRESHOLD).sum()) / int(edge.size),
    }


def apply_alpha_cutoff(image: Image.Image, cutoff: int) -> tuple[Image.Image, int]:
    if cutoff < 0 or cutoff > 254:
        fail("ALPHA_CUTOFF_INVALID", cutoff=cutoff)
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    clear = rgba[:, :, 3] <= cutoff
    cleared = int((clear & (rgba[:, :, 3] > 0)).sum())
    rgba[clear] = 0
    return Image.fromarray(rgba, "RGBA"), cleared


def split_frames(image: Image.Image, grid: dict[str, Any]) -> list[Image.Image]:
    columns = int(grid.get("columns", 1))
    rows = int(grid.get("rows", 1))
    count = int(grid.get("count", columns * rows))
    if columns < 1 or rows < 1 or count < 1 or count > columns * rows or count > MAX_FRAMES:
        fail("FRAME_GRID_INVALID")
    if image.width % columns or image.height % rows:
        fail("FRAME_GRID_NOT_DIVISIBLE", width=image.width, height=image.height)
    cell_width, cell_height = image.width // columns, image.height // rows
    frames: list[Image.Image] = []
    for index in range(count):
        x = (index % columns) * cell_width
        y = (index // columns) * cell_height
        frames.append(image.crop((x, y, x + cell_width, y + cell_height)))
    return frames


def content_bbox(frame: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(frame.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if not len(xs):
        fail("EMPTY_ALPHA_FRAME")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def parse_layout(request: dict[str, Any], target: tuple[int, int], require_explicit: bool) -> dict[str, Any]:
    """解析受控透明留边策略，旧 request 仅回落到固定画布安全区。"""
    raw = request.get("layout")
    if raw is None:
        if require_explicit:
            fail("LAYOUT_REQUIRED")
        raw = {"marginMode": "safe", "marginReason": "default-safe"}
    if not isinstance(raw, dict):
        fail("LAYOUT_INVALID")
    margin_mode = str(raw.get("marginMode", ""))
    margin_reason = str(raw.get("marginReason", ""))
    if margin_mode not in LAYOUT_MARGIN_MODES:
        fail("LAYOUT_MARGIN_MODE_INVALID", marginMode=margin_mode)
    if margin_reason not in LAYOUT_REASON_CODES:
        fail("LAYOUT_REASON_INVALID", marginReason=margin_reason)
    default_margin = DEFAULT_TIGHT_MARGIN_PIXELS if margin_mode == "tight" else max(
        1,
        int(round(min(target) * DEFAULT_SAFE_MARGIN_RATIO)),
    )
    raw_margins = raw.get("marginPixels", default_margin)
    if isinstance(raw_margins, bool):
        fail("LAYOUT_MARGIN_INVALID")
    if isinstance(raw_margins, int):
        margins = [raw_margins] * 4
    elif isinstance(raw_margins, list) and len(raw_margins) == 4 and all(
        isinstance(value, int) and not isinstance(value, bool) for value in raw_margins
    ):
        margins = [int(value) for value in raw_margins]
    else:
        fail("LAYOUT_MARGIN_INVALID")
    maximum_margin = max(1, min(target) // 4)
    if any(value < 1 or value > maximum_margin for value in margins):
        fail("LAYOUT_MARGIN_INVALID", margins=margins, maximum=maximum_margin)
    if margins[0] + margins[2] >= target[0] or margins[1] + margins[3] >= target[1]:
        fail("LAYOUT_MARGIN_INVALID", margins=margins, target=list(target))
    return {
        "marginMode": margin_mode,
        "marginReason": margin_reason,
        "configuredMargins": margins,
    }


def place_prepared_frames(
    prepared: list[Image.Image],
    source_boxes: list[tuple[int, int, int, int]],
    scales: list[float],
    target: tuple[int, int],
    anchor: tuple[float, float],
    layout: dict[str, Any],
    resample: str,
) -> tuple[list[Image.Image], list[dict[str, Any]], dict[str, Any]]:
    """把已等比处理的主体放入 tight 或 safe 的共享透明画布。"""
    left, top, right, bottom = layout["configuredMargins"]
    maximum_width = max(frame.width for frame in prepared)
    maximum_height = max(frame.height for frame in prepared)
    if layout["marginMode"] == "tight":
        canvas_size = (maximum_width + left + right, maximum_height + top + bottom)
        if canvas_size[0] > target[0] or canvas_size[1] > target[1]:
            fail("LAYOUT_CONSTRAINT_UNSATISFIABLE", actualSize=list(canvas_size), target=list(target))
    else:
        canvas_size = target
    available_width = canvas_size[0] - left - right
    available_height = canvas_size[1] - top - bottom
    outputs: list[Image.Image] = []
    layouts: list[dict[str, Any]] = []
    for index, (frame, source_box, scale) in enumerate(zip(prepared, source_boxes, scales)):
        if frame.width > available_width or frame.height > available_height:
            fail(
                "LAYOUT_CONSTRAINT_UNSATISFIABLE",
                frame=index,
                contentSize=list(frame.size),
                available=[available_width, available_height],
            )
        x = left + int(round(anchor[0] * (available_width - frame.width)))
        y = top + int(round((1.0 - anchor[1]) * (available_height - frame.height)))
        canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
        canvas.alpha_composite(frame, (x, y))
        rgba = np.asarray(canvas, dtype=np.uint8).copy()
        rgba[:, :, :3][rgba[:, :, 3] == 0] = 0
        normalized = Image.fromarray(rgba, "RGBA")
        output_box = content_bbox(normalized)
        actual_margins = [
            output_box[0],
            output_box[1],
            canvas_size[0] - output_box[2],
            canvas_size[1] - output_box[3],
        ]
        source_width = source_box[2] - source_box[0]
        source_height = source_box[3] - source_box[1]
        output_width = output_box[2] - output_box[0]
        output_height = output_box[3] - output_box[1]
        source_aspect = source_width / source_height
        output_aspect = output_width / output_height
        aspect_delta = abs(output_aspect - source_aspect) / source_aspect
        outputs.append(normalized)
        layouts.append({
            "index": index,
            "sourceRect": list(source_box),
            "rect": [output_box[0], output_box[1], output_width, output_height],
            "scale": [scale, scale],
            "resample": resample,
            "anchor": list(anchor),
            "actualMargins": actual_margins,
            "sourceAspectRatio": source_aspect,
            "outputAspectRatio": output_aspect,
            "aspectRatioRelativeDelta": aspect_delta,
            "footY": output_box[3],
        })
    maximum_aspect_delta = max(entry["aspectRatioRelativeDelta"] for entry in layouts)
    margins_satisfied = all(
        all(actual >= configured for actual, configured in zip(entry["actualMargins"], layout["configuredMargins"]))
        for entry in layouts
    )
    tight_margins_minimal = (
        layout["marginMode"] != "tight"
        or len(layouts) > 1
        or all(
            actual <= configured + 1
            for actual, configured in zip(layouts[0]["actualMargins"], layout["configuredMargins"])
        )
    )
    layout_evidence = {
        "marginMode": layout["marginMode"],
        "marginReason": layout["marginReason"],
        "requestedTarget": list(target),
        "actualSize": list(canvas_size),
        "configuredMargins": list(layout["configuredMargins"]),
        "uniformScale": len({round(value, 12) for value in scales}) == 1,
        "marginsSatisfied": margins_satisfied,
        "tightMarginsMinimal": tight_margins_minimal,
        "maximumAspectRatioRelativeDelta": maximum_aspect_delta,
        "frames": layouts,
    }
    layout_evidence["passed"] = (
        layout_evidence["uniformScale"]
        and margins_satisfied
        and tight_margins_minimal
        and (resample == "nearest" or maximum_aspect_delta <= MAX_LAYOUT_ASPECT_RATIO_RELATIVE_DELTA)
    )
    return outputs, layouts, layout_evidence


def exact_integer_scale(source: tuple[int, int], target: tuple[int, int]) -> tuple[str, int, float]:
    if source == target:
        return "identity", 1, 1.0
    if source[0] >= target[0] and source[1] >= target[1]:
        if source[0] % target[0] or source[1] % target[1]:
            fail("PIXEL_SCALE_NOT_INTEGER", source=list(source), target=list(target))
        x_factor, y_factor = source[0] // target[0], source[1] // target[1]
        if x_factor != y_factor:
            fail("PIXEL_SCALE_NOT_UNIFORM", source=list(source), target=list(target))
        return "down", x_factor, 1.0 / x_factor
    if target[0] >= source[0] and target[1] >= source[1]:
        if target[0] % source[0] or target[1] % source[1]:
            fail("PIXEL_SCALE_NOT_INTEGER", source=list(source), target=list(target))
        x_factor, y_factor = target[0] // source[0], target[1] // source[1]
        if x_factor != y_factor:
            fail("PIXEL_SCALE_NOT_UNIFORM", source=list(source), target=list(target))
        return "up", x_factor, float(x_factor)
    fail("PIXEL_SCALE_DIRECTION_MIXED", source=list(source), target=list(target))


def source_grid_fidelity(
    frames: list[Image.Image],
    target: tuple[int, int],
    alpha_threshold: int,
    minimum: float,
    colour_tolerance: int,
) -> dict[str, Any]:
    if not (0.0 <= minimum <= 1.0):
        fail("PIXEL_SOURCE_GRID_FIDELITY_MIN_INVALID", value=minimum)
    if colour_tolerance < 0 or colour_tolerance > 255:
        fail("PIXEL_SOURCE_GRID_COLOR_TOLERANCE_INVALID", value=colour_tolerance)
    scores: list[float] = []
    for frame in frames:
        direction, factor, _ = exact_integer_scale(frame.size, target)
        if direction == "up":
            score = 1.0
        else:
            rebuilt = frame.resize(target, Image.Resampling.NEAREST).resize(frame.size, Image.Resampling.NEAREST)
            actual = np.asarray(frame.convert("RGBA"), dtype=np.uint8)
            expected = np.asarray(rebuilt.convert("RGBA"), dtype=np.uint8)
            actual_opaque = actual[:, :, 3] >= alpha_threshold
            expected_opaque = expected[:, :, 3] >= alpha_threshold
            subject = actual_opaque | expected_opaque
            if not bool(subject.any()):
                fail("EMPTY_ALPHA_FRAME")
            alpha_matches = actual_opaque == expected_opaque
            colour_delta = np.max(
                np.abs(actual[:, :, :3].astype(np.int16) - expected[:, :, :3].astype(np.int16)),
                axis=2,
            )
            matches = alpha_matches & (~actual_opaque | (colour_delta <= colour_tolerance))
            score = float(matches[subject].mean())
        scores.append(score)
    evidence = {
        "method": "nearest-roundtrip-subject-v1",
        "minimumRequired": minimum,
        "colorTolerance": colour_tolerance,
        "frameScores": [round(score, 6) for score in scores],
        "minimumScore": round(min(scores), 6),
        "meanScore": round(sum(scores) / len(scores), 6),
    }
    if min(scores) < minimum:
        fail("PIXEL_SOURCE_GRID_FIDELITY_LOW", evidence=evidence)
    return evidence


def layout_frames(
    frames: list[Image.Image],
    target: tuple[int, int],
    anchor: tuple[float, float],
    preserve_scale: bool,
    layout: dict[str, Any],
) -> tuple[list[Image.Image], list[dict[str, Any]], dict[str, Any]]:
    boxes = [content_bbox(frame) for frame in frames]
    scale_modes = [exact_integer_scale(frame.size, target) for frame in frames]
    if preserve_scale and len({(mode, factor) for mode, factor, _ in scale_modes}) != 1:
        fail("PIXEL_SCALE_INCONSISTENT", scales=scale_modes)
    prepared: list[Image.Image] = []
    scales: list[float] = []
    for index, (frame, box, scale_mode) in enumerate(zip(frames, boxes, scale_modes)):
        direction, factor, scale = scale_mode
        # Resize the complete source cell by an exact integer factor. Cropping
        # first would turn an arbitrary subject bbox into a fractional scale and
        # create pseudo-pixel geometry even with nearest-neighbour sampling.
        reduced_cell = frame.resize(target, Image.Resampling.NEAREST)
        reduced_box = content_bbox(reduced_cell)
        resized = reduced_cell.crop(reduced_box)
        prepared.append(resized)
        scales.append(scale)
    outputs, layouts, evidence = place_prepared_frames(prepared, boxes, scales, target, anchor, layout, "nearest")
    for entry, scale_mode in zip(layouts, scale_modes):
        direction, factor, _ = scale_mode
        entry["integerScale"] = {"direction": direction, "factor": factor}
    evidence["frames"] = layouts
    return outputs, layouts, evidence


def normalize_pixel_art(frames: list[Image.Image], palette_colors: int, alpha_threshold: int) -> tuple[list[Image.Image], dict[str, Any]]:
    if palette_colors < 2 or palette_colors > 256:
        fail("PIXEL_PALETTE_INVALID", paletteColors=palette_colors)
    if alpha_threshold < 1 or alpha_threshold > 254:
        fail("PIXEL_ALPHA_THRESHOLD_INVALID", alphaThreshold=alpha_threshold)
    prepared_rgb: list[Image.Image] = []
    alpha_planes: list[np.ndarray] = []
    for frame in frames:
        rgba = np.asarray(frame.convert("RGBA"), dtype=np.uint8).copy()
        alpha = np.where(rgba[:, :, 3] >= alpha_threshold, 255, 0).astype(np.uint8)
        rgba[:, :, :3][alpha == 0] = 0
        prepared_rgb.append(Image.fromarray(rgba[:, :, :3], "RGB"))
        alpha_planes.append(alpha)
    palette_source = Image.new("RGB", (sum(image.width for image in prepared_rgb), max(image.height for image in prepared_rgb)), (0, 0, 0))
    offset = 0
    for image in prepared_rgb:
        palette_source.paste(image, (offset, 0))
        offset += image.width
    palette = palette_source.quantize(
        colors=palette_colors,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    )
    outputs: list[Image.Image] = []
    opaque_colours: set[tuple[int, int, int]] = set()
    for rgb, alpha in zip(prepared_rgb, alpha_planes):
        quantized = rgb.quantize(palette=palette, dither=Image.Dither.NONE).convert("RGB")
        rgba = np.dstack((np.asarray(quantized, dtype=np.uint8), alpha))
        rgba[:, :, :3][alpha == 0] = 0
        opaque = rgba[:, :, :3][alpha == 255]
        opaque_colours.update(tuple(int(channel) for channel in colour) for colour in opaque)
        outputs.append(Image.fromarray(rgba.astype(np.uint8), "RGBA"))
    return outputs, {
        "resample": "nearest",
        "integerScaleRequired": True,
        "paletteColorsRequested": palette_colors,
        "opaqueColorCount": len(opaque_colours),
        "paletteDither": False,
        "alphaThreshold": alpha_threshold,
        "semiTransparentPixels": 0,
    }


def layout_raster_frames(
    frames: list[Image.Image],
    target: tuple[int, int],
    anchor: tuple[float, float],
    preserve_scale: bool,
    layout: dict[str, Any],
) -> tuple[list[Image.Image], list[dict[str, Any]], dict[str, Any]]:
    """以单一 Lanczos scale 布局 Alpha 主体，禁止完整 cell 非等比拉伸。"""
    source_boxes = [content_bbox(frame) for frame in frames]
    if len(frames) > 1 and not preserve_scale:
        fail("LAYOUT_PRESERVE_SCALE_REQUIRED")
    left, top, right, bottom = layout["configuredMargins"]
    available_width = target[0] - left - right
    available_height = target[1] - top - bottom
    maximum_width = max(box[2] - box[0] for box in source_boxes)
    maximum_height = max(box[3] - box[1] for box in source_boxes)
    scale = min(available_width / maximum_width, available_height / maximum_height)
    if not math.isfinite(scale) or scale <= 0:
        fail("LAYOUT_CONSTRAINT_UNSATISFIABLE")
    prepared: list[Image.Image] = []
    for frame, source_box in zip(frames, source_boxes):
        cropped = frame.crop(source_box)
        resized_size = (
            max(1, int(round(cropped.width * scale))),
            max(1, int(round(cropped.height * scale))),
        )
        resized = cropped.resize(resized_size, Image.Resampling.LANCZOS)
        rgba = np.asarray(resized.convert("RGBA"), dtype=np.uint8).copy()
        rgba[:, :, :3][rgba[:, :, 3] == 0] = 0
        prepared.append(Image.fromarray(rgba, "RGBA"))
    return place_prepared_frames(
        prepared,
        source_boxes,
        [scale] * len(frames),
        target,
        anchor,
        layout,
        "lanczos",
    )


def raster_evidence(frames: list[Image.Image]) -> dict[str, Any]:
    """记录不与完美像素门禁混用的光栅 Alpha/色彩证据。"""
    rgba_frames = [np.asarray(frame.convert("RGBA"), dtype=np.uint8) for frame in frames]
    semi_transparent = sum(int(((rgba[:, :, 3] > 0) & (rgba[:, :, 3] < 255)).sum()) for rgba in rgba_frames)
    transparent_rgb = sum(int((np.any(rgba[:, :, :3] != 0, axis=2) & (rgba[:, :, 3] == 0)).sum()) for rgba in rgba_frames)
    opaque_colours: set[tuple[int, int, int]] = set()
    for rgba in rgba_frames:
        for colour in rgba[:, :, :3][rgba[:, :, 3] > ALPHA_EMPTY_THRESHOLD]:
            opaque_colours.add(tuple(int(channel) for channel in colour))
    return {
        "resample": "lanczos",
        "alphaMode": "continuous",
        "semiTransparentPixels": semi_transparent,
        "transparentRgbPixels": transparent_rgb,
        "opaqueColorCount": len(opaque_colours),
        "quantized": False,
    }


def layout_opaque_background(
    image: Image.Image,
    target: tuple[int, int],
) -> tuple[list[Image.Image], list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    """保留完整不透明画布，并仅在宽高比完全一致时等比缩放。"""
    source_size = image.size
    if source_size[0] * target[1] != source_size[1] * target[0]:
        source_aspect = source_size[0] / source_size[1]
        target_aspect = target[0] / target[1]
        fail(
            "OPAQUE_BACKGROUND_ASPECT_RATIO_MISMATCH",
            source=list(source_size),
            target=list(target),
            relativeDelta=abs(target_aspect - source_aspect) / source_aspect,
        )
    source_alpha = np.asarray(image.getchannel("A"), dtype=np.uint8)
    if bool((source_alpha != 255).any()):
        fail(
            "OPAQUE_BACKGROUND_SOURCE_NOT_OPAQUE",
            transparentPixels=int((source_alpha == 0).sum()),
            semiTransparentPixels=int(((source_alpha > 0) & (source_alpha < 255)).sum()),
        )
    scale = target[0] / source_size[0]
    resized = image.resize(target, Image.Resampling.LANCZOS)
    output_alpha = np.asarray(resized.getchannel("A"), dtype=np.uint8)
    transparent_pixels = int((output_alpha == 0).sum())
    semi_transparent_pixels = int(((output_alpha > 0) & (output_alpha < 255)).sum())
    frame = {
        "index": 0,
        "sourceRect": [0, 0, source_size[0], source_size[1]],
        "rect": [0, 0, target[0], target[1]],
        "scale": [scale, scale],
        "resample": "lanczos",
        "actualMargins": [0, 0, 0, 0],
        "sourceAspectRatio": source_size[0] / source_size[1],
        "outputAspectRatio": target[0] / target[1],
        "aspectRatioRelativeDelta": 0.0,
        "footY": target[1],
    }
    opaque_evidence = {
        "method": "full-canvas-raster-v1",
        "resample": "lanczos",
        "sourceSize": list(source_size),
        "targetSize": list(target),
        "scale": [scale, scale],
        "fullyOpaque": transparent_pixels == 0 and semi_transparent_pixels == 0,
        "fullCanvasPreserved": True,
        "exactTarget": resized.size == target,
        "transparentPixels": transparent_pixels,
        "semiTransparentPixels": semi_transparent_pixels,
        "quantized": False,
    }
    opaque_evidence["passed"] = (
        opaque_evidence["fullyOpaque"]
        and opaque_evidence["fullCanvasPreserved"]
        and opaque_evidence["exactTarget"]
    )
    layout_evidence = {
        "mode": "full-canvas",
        "requestedTarget": list(target),
        "actualSize": list(resized.size),
        "uniformScale": True,
        "fullCanvasPreserved": True,
        "maximumAspectRatioRelativeDelta": 0.0,
        "passed": True,
        "frames": [frame],
    }
    return [resized], [frame], layout_evidence, opaque_evidence


def save_png(image: Image.Image, path: Path) -> dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=False, compress_level=9)
    return {"sha256": sha256(path), "bytes": path.stat().st_size, "width": image.width, "height": image.height}


def build_atlas(frames: list[Image.Image], output: Path, padding: int = 2, extrusion: int = 1) -> tuple[dict[str, Any], list[dict[str, int]]]:
    cell_width = frames[0].width + 2 * extrusion
    cell_height = frames[0].height + 2 * extrusion
    columns = int(math.ceil(math.sqrt(len(frames))))
    rows = int(math.ceil(len(frames) / columns))
    atlas = Image.new("RGBA", (padding + columns * (cell_width + padding), padding + rows * (cell_height + padding)), (0, 0, 0, 0))
    rects: list[dict[str, int]] = []
    for index, frame in enumerate(frames):
        x = padding + (index % columns) * (cell_width + padding) + extrusion
        y = padding + (index // columns) * (cell_height + padding) + extrusion
        atlas.alpha_composite(frame, (x, y))
        if extrusion:
            atlas.paste(frame.crop((0, 0, frame.width, 1)), (x, y - 1))
            atlas.paste(frame.crop((0, frame.height - 1, frame.width, frame.height)), (x, y + frame.height))
            atlas.paste(frame.crop((0, 0, 1, frame.height)), (x - 1, y))
            atlas.paste(frame.crop((frame.width - 1, 0, frame.width, frame.height)), (x + frame.width, y))
        rects.append({"index": index, "x": x, "y": y, "width": frame.width, "height": frame.height})
    return save_png(atlas, output), rects


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()
    request = load_json(Path(args.request))
    if request.get("schema") != REQUEST_SCHEMA:
        fail("REQUEST_SCHEMA_INVALID")
    asset_kind = str(request.get("assetKind", "character"))
    transparency_mode = str(request.get("transparencyMode", "transparent"))
    if transparency_mode not in ("transparent", "opaque"):
        fail("TRANSPARENCY_MODE_INVALID", transparencyMode=transparency_mode)
    opaque_background = transparency_mode == "opaque"
    if asset_kind == "background" and not opaque_background:
        fail("BACKGROUND_REQUIRES_OPAQUE_MODE")
    if opaque_background and asset_kind != "background":
        fail("OPAQUE_MODE_REQUIRES_BACKGROUND", assetKind=asset_kind)
    requested_render_mode = request.get("renderMode")
    if requested_render_mode is None:
        render_mode = "pixel-art" if "pixelArt" in request else "raster"
        render_reason = "legacy-explicit-pixel-config" if render_mode == "pixel-art" else "default-raster"
    else:
        render_mode = str(requested_render_mode)
        render_reason = str(request.get("renderReason", "explicit-request"))
    if render_mode not in ("raster", "pixel-art"):
        fail("RENDER_MODE_INVALID", renderMode=render_mode)
    if render_reason not in RENDER_REASON_CODES:
        fail("RENDER_REASON_INVALID", renderReason=render_reason)
    if render_mode == "raster" and "pixelArt" in request:
        fail("RENDER_MODE_CONFIG_CONFLICT", renderMode=render_mode)
    if opaque_background:
        conflicts = [
            key for key in ("chromaKey", "pixelArt", "layout", "anchor", "atlas", "manifest", "fps", "loop")
            if key in request
        ]
        if conflicts:
            fail("OPAQUE_BACKGROUND_CONFIG_CONFLICT", fields=conflicts)
        grid = request.get("grid")
        if not isinstance(grid, dict) or any(grid.get(key) != 1 for key in ("columns", "rows", "count")):
            fail("OPAQUE_BACKGROUND_SINGLE_FRAME_REQUIRED")
        if requested_render_mode != "raster":
            fail("OPAQUE_BACKGROUND_RASTER_REQUIRED")
    run_id = str(request.get("runId", ""))
    run_root = inside(Path(request["runRoot"]), Path(request["runRoot"]))
    source = inside(run_root, Path(request["source"]))
    output_root = inside(run_root, Path(request["outputRoot"]), must_exist=False)
    report_path = inside(run_root, Path(args.report), must_exist=False)
    if source.stat().st_size > MAX_INPUT_BYTES:
        fail("INPUT_BUDGET_EXCEEDED")
    with Image.open(source) as opened:
        opened.load()
        if opened.width * opened.height > MAX_PIXELS:
            fail("PIXEL_BUDGET_EXCEEDED")
        image = opened.convert("RGBA")
    initial_transparency = transparency_evidence(image, "source-alpha-v1")
    chroma_evidence: dict[str, Any] | None = None
    chroma = request.get("chromaKey")
    if opaque_background:
        processed_transparency = initial_transparency
    elif chroma is not None and initial_transparency["transparentPixels"] == 0:
        if not isinstance(chroma, dict) or not isinstance(chroma.get("rgb"), list) or len(chroma["rgb"]) != 3:
            fail("CHROMA_KEY_INVALID")
        expected_key = [int(value) for value in chroma["rgb"]]
        requested_tolerance = float(chroma.get("tolerance", 38))
        maximum_tolerance = float(chroma.get("maxTolerance", MAX_ADAPTIVE_CHROMA_TOLERANCE))
        if requested_tolerance <= 0 or maximum_tolerance < requested_tolerance or maximum_tolerance > MAX_ADAPTIVE_CHROMA_TOLERANCE:
            fail("CHROMA_TOLERANCE_INVALID")
        actual_key, actual_tolerance, adaptive_evidence = infer_chroma_from_image(
            image,
            expected_key,
            requested_tolerance,
            maximum_tolerance,
        )
        image, chroma_evidence = remove_image_chroma(
            image,
            actual_key,
            actual_tolerance,
            float(chroma.get("feather", 24)),
        )
        chroma_evidence.update(adaptive_evidence)
        image, despill_pixels = despill_inferred_chroma(image, actual_key, actual_tolerance)
        image, cutoff_pixels = apply_alpha_cutoff(
            image,
            int(chroma.get("alphaCutoff", DEFAULT_CHROMA_ALPHA_CUTOFF)),
        )
        chroma_evidence["alphaCutoff"] = int(chroma.get("alphaCutoff", DEFAULT_CHROMA_ALPHA_CUTOFF))
        chroma_evidence["alphaCutoffPixels"] = cutoff_pixels
        chroma_evidence["despillPixels"] = despill_pixels
        residual_evidence = chroma_residual_evidence(
            image,
            actual_key,
            actual_tolerance,
            float(chroma.get("feather", 24)),
        )
        chroma_evidence.update(residual_evidence)
        chroma_evidence["residualForbiddenKeyPixels"] = residual_evidence["residualKeyPixels"]
        if chroma_evidence["residualKeyPixels"] > 0:
            fail("CHROMA_KEY_INSIDE_SUBJECT", residualKeyPixels=chroma_evidence["residualKeyPixels"])
        processed_transparency = transparency_evidence(image, "image-wide-chroma-v2")
    else:
        if initial_transparency["transparentPixels"] == 0:
            fail("OPAQUE_SOURCE_REQUIRES_CHROMA_KEY")
        processed_transparency = initial_transparency
    if not opaque_background:
        if processed_transparency["transparentPixels"] == 0 or processed_transparency["opaquePixels"] == 0:
            fail("TRANSPARENCY_NOT_PROVABLE", evidence=processed_transparency)
        if processed_transparency["edgeTransparentRatio"] < 0.95:
            fail("BACKGROUND_TOUCHES_SOURCE_EDGE", evidence=processed_transparency)
    frames = split_frames(image, request.get("grid", {"columns": 1, "rows": 1, "count": 1}))
    target_raw = request.get("target", [frames[0].width, frames[0].height])
    target = (int(target_raw[0]), int(target_raw[1]))
    if target[0] < 1 or target[1] < 1 or target[0] * target[1] > MAX_PIXELS:
        fail("TARGET_INVALID")
    anchor = (0.5, 0.5)
    layout_policy: dict[str, Any] | None = None
    preserve_scale = True
    if not opaque_background:
        anchor_raw = request.get("anchor", [0.5, 0.0])
        anchor = (float(anchor_raw[0]), float(anchor_raw[1]))
        if not (0 <= anchor[0] <= 1 and 0 <= anchor[1] <= 1):
            fail("ANCHOR_INVALID")
        layout_policy = parse_layout(request, target, requested_render_mode is not None)
        preserve_scale = bool(request.get("preserveScale", True))
    pixel_art = request.get("pixelArt") or {}
    if not isinstance(pixel_art, dict):
        fail("PIXEL_ART_CONFIG_INVALID")
    pixel_art_evidence: dict[str, Any] | None = None
    raster_qc: dict[str, Any] | None = None
    opaque_background_qc: dict[str, Any] | None = None
    layout_evidence: dict[str, Any]
    if opaque_background:
        laid_out, layouts, layout_evidence, opaque_background_qc = layout_opaque_background(image, target)
    elif render_mode == "pixel-art":
        alpha_threshold = int(pixel_art.get("alphaThreshold", DEFAULT_PIXEL_ALPHA_THRESHOLD))
        grid_fidelity = source_grid_fidelity(
            frames,
            target,
            alpha_threshold,
            float(pixel_art.get("sourceGridFidelityMin", DEFAULT_SOURCE_GRID_FIDELITY_MIN)),
            int(pixel_art.get("sourceGridColorTolerance", DEFAULT_SOURCE_GRID_COLOR_TOLERANCE)),
        )
        laid_out, layouts, layout_evidence = layout_frames(frames, target, anchor, preserve_scale, layout_policy)
        laid_out, pixel_art_evidence = normalize_pixel_art(
            laid_out,
            int(pixel_art.get("paletteColors", DEFAULT_PIXEL_PALETTE_COLORS)),
            alpha_threshold,
        )
        pixel_art_evidence["sourceGridFidelity"] = grid_fidelity
    else:
        laid_out, layouts, layout_evidence = layout_raster_frames(
            frames,
            target,
            anchor,
            preserve_scale,
            layout_policy,
        )
        raster_qc = raster_evidence(laid_out)
    if output_root.exists():
        if not output_root.is_dir():
            fail("OUTPUT_ROOT_NOT_DIRECTORY")
        if any(output_root.iterdir()):
            fail("OUTPUT_ROOT_NOT_EMPTY")
    else:
        output_root.mkdir(parents=True, exist_ok=False)
    outputs: list[dict[str, Any]] = []
    frame_entries: list[dict[str, Any]] = []
    for index, frame in enumerate(laid_out):
        frame_path = output_root / "frames" / f"frame-{index:04d}.png"
        info = save_png(frame, frame_path)
        relative = frame_path.relative_to(run_root).as_posix()
        outputs.append({"relativePath": relative, "packagePath": f"frames/frame-{index:04d}.png", "sha256": info["sha256"]})
        frame_entries.append({"index": index, "path": f"frames/frame-{index:04d}.png", **info, **layouts[index]})
    atlas_info = None
    if bool(request.get("atlas", False)):
        atlas_path = output_root / "atlas.png"
        atlas_file, rects = build_atlas(laid_out, atlas_path)
        outputs.append({"relativePath": atlas_path.relative_to(run_root).as_posix(), "packagePath": "atlas.png", "sha256": atlas_file["sha256"]})
        atlas_info = {**atlas_file, "path": "atlas.png", "rects": rects, "padding": 2, "extrusion": 1, "authority": False}
    if not opaque_background:
        preview_path = output_root / "contact-sheet.png"
        preview_file, _ = build_atlas(laid_out, preview_path, padding=6, extrusion=0)
        outputs.append({"relativePath": preview_path.relative_to(run_root).as_posix(), "packagePath": "diagnostics/contact-sheet.png", "sha256": preview_file["sha256"]})
    foot_values = [entry["footY"] for entry in layouts]
    include_manifest = (
        len(laid_out) > 1
        or bool(request.get("manifest", False))
        or bool(request.get("atlas", False))
        or "fps" in request
        or "loop" in request
    )
    manifest_path = output_root / "cocos-sprite-manifest.json"
    manifest_sha256: str | None = None
    if include_manifest:
        manifest = {
            "$schema": "game-agent.cocos-sprite-manifest/v1",
            "runId": run_id,
            "cocosCreator": ">=3.8.0",
            "authority": "loose-frames",
            "assetKind": request.get("assetKind", "character"),
            "frames": frame_entries,
            "atlas": atlas_info,
            "animationIntent": {"fps": int(request.get("fps", 8)), "loop": bool(request.get("loop", True))},
            "filter": "nearest" if render_mode == "pixel-art" else "linear",
            "wrap": "clamp-to-edge",
            "renderMode": render_mode,
            "layout": layout_evidence,
            "pixelArt": pixel_art_evidence,
            "raster": raster_qc,
            "creatorVerified": False,
            "playbackVerified": False,
        }
        write_json(manifest_path, manifest)
        manifest_sha256 = sha256(manifest_path)
        outputs.append({"relativePath": manifest_path.relative_to(run_root).as_posix(), "packagePath": "cocos-sprite-manifest.json", "sha256": manifest_sha256})
    total_bytes = sum((run_root / entry["relativePath"]).stat().st_size for entry in outputs)
    output_alpha = [np.asarray(frame.getchannel("A"), dtype=np.uint8) for frame in laid_out]
    output_transparent_pixels = sum(int((alpha <= ALPHA_EMPTY_THRESHOLD).sum()) for alpha in output_alpha)
    output_opaque_pixels = sum(int((alpha > ALPHA_EMPTY_THRESHOLD).sum()) for alpha in output_alpha)
    output_semi_transparent_pixels = sum(int(((alpha > 0) & (alpha < 255)).sum()) for alpha in output_alpha)
    output_edge_opaque_pixels = sum(
        int((np.concatenate((alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1])) > ALPHA_EMPTY_THRESHOLD).sum())
        for alpha in output_alpha
    )
    genuine_transparency = output_transparent_pixels > 0 and output_opaque_pixels > 0 and output_edge_opaque_pixels == 0
    chroma_clean = chroma_evidence is None or chroma_evidence.get("residualForbiddenKeyPixels") == 0
    if opaque_background:
        branch_passed = opaque_background_qc is not None and bool(opaque_background_qc.get("passed"))
    elif render_mode == "pixel-art":
        branch_passed = (
            output_semi_transparent_pixels == 0
            and pixel_art_evidence is not None
            and pixel_art_evidence["opaqueColorCount"] <= pixel_art_evidence["paletteColorsRequested"]
        )
    else:
        branch_passed = raster_qc is not None and raster_qc["transparentRgbPixels"] == 0
    layout_passed = bool(layout_evidence.get("passed"))
    qc_checks = {
        "decodedRgba": True,
        "renderMode": render_mode,
        "transparencyMode": transparency_mode,
        "transparencySource": processed_transparency["method"],
        "chromaApplied": chroma_evidence is not None,
        "nonEmptyAlpha": output_opaque_pixels > 0,
        "transparentPixels": output_transparent_pixels,
        "opaquePixels": output_opaque_pixels,
        "edgeOpaquePixels": output_edge_opaque_pixels,
        "semiTransparentPixels": output_semi_transparent_pixels,
        "frameCount": len(laid_out),
        "consistentSize": True,
        "footJitterPixels": max(foot_values) - min(foot_values),
        "outputBytes": total_bytes,
        "withinBudget": total_bytes <= MAX_OUTPUT_BYTES,
        "layout": layout_evidence,
    }
    if opaque_background:
        qc_checks["opaqueBackground"] = opaque_background_qc
    else:
        qc_checks["genuineTransparency"] = genuine_transparency
        qc_checks["chromaResidualPixels"] = 0 if chroma_evidence is None else chroma_evidence.get("residualForbiddenKeyPixels")
    if render_mode == "pixel-art":
        qc_checks["pixelPerfect"] = branch_passed
        qc_checks["pixelArt"] = pixel_art_evidence
    elif not opaque_background:
        qc_checks["raster"] = raster_qc
    qc = {
        "passed": total_bytes <= MAX_OUTPUT_BYTES and max(foot_values) - min(foot_values) <= 1 and branch_passed and layout_passed and (
            opaque_background or (genuine_transparency and chroma_clean)
        ),
        "checks": {
            **qc_checks,
        },
        "chromaEvidence": chroma_evidence,
        "transparencyEvidence": processed_transparency,
    }
    authority_frame = outputs[0]
    delivery = {
        "kind": "manifest" if include_manifest else "static-single-frame",
        "frameCount": len(laid_out),
        "manifestIncluded": include_manifest,
        "authorityPath": authority_frame["packagePath"],
        "authoritySha256": authority_frame["sha256"],
    }
    report = {
        "schema": REPORT_SCHEMA,
        "runId": run_id,
        "sourceSha256": sha256(source),
        "assetKind": asset_kind,
        "renderMode": render_mode,
        "renderReason": render_reason,
        "transparencyMode": transparency_mode,
        "layout": layout_evidence,
        "delivery": delivery,
        "outputs": outputs,
        "qc": qc,
    }
    if manifest_sha256 is not None:
        report["manifestSha256"] = manifest_sha256
    if not qc["passed"]:
        fail("QC_FAILED", qc=qc)
    write_json(report_path, report)
    print(json.dumps({"ok": True, "report": str(report_path), "frames": len(laid_out), "qc": qc}, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from None
