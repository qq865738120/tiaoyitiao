#!/usr/bin/env python3
"""Deterministic four-quadrant split and semantic UI crop extraction."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import warnings as python_warnings
from pathlib import Path
from typing import Any, Iterable

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

MAX_INPUT_BYTES = 64 * 1024 * 1024
MAX_PIXELS = 16_777_216
Image.MAX_IMAGE_PIXELS = MAX_PIXELS


def recover_native_alpha_noise(image: Image.Image) -> Image.Image | None:
    """Recover bounded endpoint noise only when distributed native transparency exists."""
    rgba = np.asarray(image.convert("RGBA")).copy()
    alpha = rgba[:, :, 3]
    if (alpha == 0).mean() >= .01:
        return None
    h, w = alpha.shape
    near_clear = alpha <= 16
    regions = [near_clear[:h//2, :w//2], near_clear[:h//2, w//2:],
               near_clear[h//2:, :w//2], near_clear[h//2:, w//2:]]
    if (near_clear.mean() < .05 or (alpha >= 224).mean() < .01
            or sum(region.size > 0 and region.mean() >= .02 for region in regions) < 3):
        return None
    rgba[:, :, 3] = np.rint(np.clip((alpha.astype(np.float32) - 16) * 255 / 224, 0, 255)).astype(np.uint8)
    return Image.fromarray(rgba)


def candidate_raster_evidence(source: Image.Image, candidate: Image.Image, report: dict[str, Any]) -> dict[str, Any] | None:
    """Assess retained UI artwork independently from the shared colour-fit rating."""
    background = report.get("background", {})
    key = background.get("inferredKey")
    noise = background.get("noise")
    if (report.get("status") != "review_required"
            or report.get("reasons") != ["FOREGROUND_ESTIMATE_UNCERTAIN"]
            or report.get("method") != "solid-color-matting-v1"
            or report.get("keyColorUsage") != "caller-asserted-background-only"
            or candidate.size != source.size
            or not isinstance(key, list) or len(key) != 3
            or not all(isinstance(v, (int, float)) and np.isfinite(v) and 0 <= v <= 255 for v in key)
            or not isinstance(noise, (int, float)) or not np.isfinite(noise) or not 0 <= noise <= 24
            or background.get("coverage", 0) < .65
            or sum(value >= .5 for value in background.get("edgeSupport", [])) < 3):
        return None
    original = np.asarray(source.convert("RGBA"))
    alpha = np.asarray(candidate.convert("RGBA"))[:, :, 3]
    source_body = np.linalg.norm(original[:, :, :3].astype(np.float32) - np.asarray(key), axis=2) > max(.6, noise + 1)
    body_count = int(source_body.sum())
    if body_count < 32 or (original[:, :, 3] != 255).any():
        return None
    retained = int((source_body & (alpha > 8)).sum())
    core = int((source_body & (alpha >= 96)).sum())
    clear = int((~source_body & (alpha == 0)).sum())
    background_count = int((~source_body).sum())
    if retained < body_count * .95 or core < body_count * .5 or background_count < 32 or clear < background_count * .95:
        return None
    return {"method": "retained-solid-background-candidate", "sourceBodyPixels": body_count,
            "retainedBodyPixels": retained, "corePixels": core, "backgroundPixels": background_count,
            "clearBackgroundPixels": clear, "uncertainPixels": report.get("uncertainPixels", 0)}


def effect_source_crops(effect: Image.Image, observation: dict[str, Any], intent: dict[str, Any]) -> list[dict[str, Any]]:
    """Keep visible static artwork from the effect when its separate source is missing."""
    confirmed = {issue.get("semanticKey") for issue in observation.get("layerAudit", {}).get("issues", [])
                 if issue.get("code") == "source-missing" and issue.get("quadrant") == "ui"}
    semantics = {item["semanticKey"]: item for item in intent.get("elements", [])}
    results = []
    for node in observation["nodes"]:
        if (node["semanticKey"] not in confirmed or node.get("role") != "sprite"
                or node.get("visualStatus") != "visible" or node.get("sourceLayer") != "ui" or node.get("sourceBox")
                or semantics.get(node["semanticKey"], {}).get("interactive") is not False):
            continue
        x0, y0, x1, y1 = pixel_roi(node["box"], intent["canvas"], effect.size)
        rgba = np.array(effect.crop((x0, y0, x1, y1)))
        excluded = []
        for other in observation["nodes"]:
            if other.get("role") not in {"label", "button"} or other.get("visualStatus") != "visible":
                continue
            bx0, by0, bx1, by1 = pixel_roi(other["box"], intent["canvas"], effect.size)
            left, top, right, bottom = max(x0, bx0), max(y0, by0), min(x1, bx1), min(y1, by1)
            if right > left and bottom > top:
                rgba[top-y0:bottom-y0, left-x0:right-x0, 3] = 0
                excluded.append(other["id"])
        retained = int((rgba[:, :, 3] > 8).sum())
        if retained < 32 or retained < rgba.shape[0] * rgba.shape[1] * .35:
            continue
        source_box = {"x": x0, "y": y0, "width": x1-x0, "height": y1-y0}
        results.append({"node": node, "image": Image.fromarray(rgba), "sourceBox": source_box,
                        "targetBox": dict(node["box"]), "sourceLayer": "effect",
                        "alignment": {"method": "effect-region-with-component-exclusions", "excludedNodeIds": excluded,
                                      "retainedPixels": retained}})
    return results


def read_stdin() -> dict[str, Any]:
    value = json.load(sys.stdin)
    if not isinstance(value, dict):
        raise RuntimeError("UI_EXTRACTION_INPUT_INVALID")
    return value


def lineage(handles: Iterable[dict[str, Any]]) -> list[dict[str, str]]:
    return [{"artifactId": item["artifactId"], "digest": item["digest"]} for item in handles if item]


def write_png(path: Path, image: Image.Image) -> str:
    image.save(path, format="PNG", compress_level=9, optimize=False)
    return hashlib.sha256(path.read_bytes()).hexdigest()


def publish_image(client: Any, image: Image.Image, schema_id: str, source: list[dict[str, Any]], name: str, retention_days: int) -> dict[str, Any]:
    created = client.call("createArtifact", {
        "mediaType": "image/png", "schemaId": schema_id,
        "retentionMs": retention_days * 24 * 60 * 60 * 1000,
    })
    output_path = client.resolve_attempt_path(created["relativePath"])
    digest = write_png(output_path, image.convert("RGBA"))
    return client.call("finalizeArtifact", {
        "writerId": created["writerId"], "expectedDigest": digest,
        "lineage": lineage(source),
    })["handle"]


def publish_json(client: Any, value: Any, schema_id: str, source: list[dict[str, Any]], retention_days: int) -> dict[str, Any]:
    created = client.call("createArtifact", {
        "mediaType": "application/json", "schemaId": schema_id,
        "retentionMs": retention_days * 24 * 60 * 60 * 1000,
    })
    output_path = client.resolve_attempt_path(created["relativePath"])
    payload = (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    output_path.write_bytes(payload)
    digest = hashlib.sha256(payload).hexdigest()
    return client.call("finalizeArtifact", {
        "writerId": created["writerId"], "expectedDigest": digest,
        "lineage": lineage(source),
    })["handle"]


def contiguous_runs(indices: np.ndarray) -> list[tuple[int, int]]:
    if indices.size == 0:
        return []
    runs: list[tuple[int, int]] = []
    start = previous = int(indices[0])
    for raw in indices[1:]:
        value = int(raw)
        if value != previous + 1:
            runs.append((start, previous + 1))
            start = value
        previous = value
    runs.append((start, previous + 1))
    return runs


def separator_transition_edge(rgb: np.ndarray, axis: str, edge: int, direction: int) -> int:
    """Include black-line antialias shoulders only up to a stable outward plateau."""
    lines = np.moveaxis(rgb, 1, 0) if axis == "vertical" else rgb
    length = len(lines)
    limit = max(3, int(length * .006))
    previous = lines[edge - direction]
    for distance in range(limit + 1):
        index = edge + direction * distance
        if min(index, index + direction * 2) < 0 or max(index, index + direction * 2) >= length:
            break
        current = lines[index]
        # Black compositing darkens each local background independently. Compare
        # corresponding pixels, not a single line color (quadrants differ).
        brightening = np.max(current, axis=1) - np.max(previous, axis=1)
        if float(np.mean(brightening >= -16)) < .90:
            break
        next_line = lines[index + direction]
        outer_line = lines[index + direction * 2]
        stable = (np.max(np.abs(current - next_line), axis=1) <= 16) & (np.max(np.abs(next_line - outer_line), axis=1) <= 16)
        if float(np.mean(stable)) >= .90:
            return index
        previous = current
    return edge


def detect_band(array: np.ndarray, axis: str) -> dict[str, Any]:
    height, width = array.shape[:2]
    length = width if axis == "vertical" else height
    center = length / 2.0
    search_start = max(1, int(length * 0.35))
    search_end = min(length - 1, int(length * 0.65))
    rgb = array[:, :, :3].astype(np.float32)
    alpha = array[:, :, 3].astype(np.float32)
    darkness = 1.0 - np.mean(rgb, axis=2) / 255.0
    neutrality = 1.0 - (np.max(rgb, axis=2) - np.min(rgb, axis=2)) / 255.0
    score_pixel = np.clip(darkness, 0, 1) * np.clip(neutrality, 0, 1) * (alpha / 255.0)
    coverage_pixel = (darkness > 0.55) & (neutrality > 0.72) & (alpha > 80)
    scores = np.mean(score_pixel, axis=0 if axis == "vertical" else 1)
    coverage = np.mean(coverage_pixel, axis=0 if axis == "vertical" else 1)
    # 分隔线应跨越绝大多数正交轴，并在中心搜索带中接近最暗的中性色；
    # 固定低阈值会把深色游戏背景与中心线并成宽块，最终误回退或误删背景。
    local_coverage = coverage[search_start:search_end]
    local_scores = scores[search_start:search_end]
    covered_scores = local_scores[local_coverage >= 0.70]
    adaptive_score_floor = max(0.28, float(np.max(covered_scores)) - 0.08) if covered_scores.size else 1.0
    candidates = np.arange(search_start, search_end)[
        (local_coverage >= 0.70) & (local_scores >= adaptive_score_floor)
    ]
    runs = contiguous_runs(candidates)
    max_thickness = max(8, int(length * 0.025))
    runs = [item for item in runs if item[1] - item[0] <= max_thickness]
    if not runs:
        split = int(round(center))
        return {"start": split, "end": split, "confidence": 0.0, "fallback": "geometric-center", "coverage": 0.0, "score": 0.0}
    ranked = sorted(runs, key=lambda item: (
        -float(np.mean(scores[item[0]:item[1]])) + abs(((item[0] + item[1]) / 2.0) - center) / length,
        item[0],
    ))
    start, end = ranked[0]
    mean_score = float(np.mean(scores[start:end]))
    mean_coverage = float(np.mean(coverage[start:end]))
    confidence = max(0.0, min(1.0, mean_score * 0.45 + mean_coverage * 0.45 + (1.0 - abs(((start + end) / 2.0) - center) / (length * 0.15)) * 0.1))
    start = separator_transition_edge(rgb, axis, start - 1, -1) + 1
    end = separator_transition_edge(rgb, axis, end, 1)
    return {"start": start, "end": end, "confidence": confidence, "fallback": None, "coverage": mean_coverage, "score": mean_score}




class UnionFind:
    def __init__(self) -> None:
        self.parent: list[int] = []

    def add(self) -> int:
        value = len(self.parent)
        self.parent.append(value)
        return value

    def find(self, value: int) -> int:
        while self.parent[value] != value:
            self.parent[value] = self.parent[self.parent[value]]
            value = self.parent[value]
        return value

    def union(self, left: int, right: int) -> None:
        a, b = self.find(left), self.find(right)
        if a != b:
            self.parent[max(a, b)] = min(a, b)


def components(mask: np.ndarray, with_spans: bool = False) -> list[Any]:
    uf = UnionFind()
    spans: list[tuple[int, int, int, int]] = []
    previous: list[tuple[int, int, int]] = []
    for y in range(mask.shape[0]):
        padded = np.pad(mask[y].astype(np.int8), (1, 1))
        changes = np.diff(padded)
        starts = np.where(changes == 1)[0]
        ends = np.where(changes == -1)[0]
        current: list[tuple[int, int, int]] = []
        for x0, x1 in zip(starts.tolist(), ends.tolist()):
            label = uf.add()
            for px0, px1, plabel in previous:
                if px1 >= x0 and x1 >= px0:
                    uf.union(label, plabel)
            spans.append((y, x0, x1, label))
            current.append((x0, x1, label))
        previous = current
    boxes: dict[int, list[int]] = {}
    grouped_spans: dict[int, list[tuple[int, int, int]]] = {}
    for y, x0, x1, label in spans:
        root = uf.find(label)
        grouped_spans.setdefault(root, []).append((y, x0, x1))
        box = boxes.setdefault(root, [x0, y, x1, y + 1])
        box[0] = min(box[0], x0); box[1] = min(box[1], y)
        box[2] = max(box[2], x1); box[3] = max(box[3], y + 1)
    if with_spans:
        return [(tuple(box), grouped_spans[root]) for root, box in boxes.items()]
    return [tuple(value) for value in boxes.values()]


def semantic_crop(ui_image: Image.Image, node: dict[str, Any], canvas: dict[str, int]) -> tuple[Image.Image | None, dict[str, int]]:
    width, height = ui_image.size
    box = node.get("sourceBox") or node["box"]
    x0 = max(0, min(width - 1, int(np.floor(box["x"] / canvas["width"] * width))))
    y0 = max(0, min(height - 1, int(np.floor(box["y"] / canvas["height"] * height))))
    x1 = max(x0 + 1, min(width, int(np.ceil((box["x"] + box["width"]) / canvas["width"] * width))))
    y1 = max(y0 + 1, min(height, int(np.ceil((box["y"] + box["height"]) / canvas["height"] * height))))
    roi = np.array(ui_image.crop((x0, y0, x1, y1)), dtype=np.uint8)
    found = components(roi[:, :, 3] > 8)
    if not found:
        return None, {"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0}
    bx0 = max(0, min(item[0] for item in found) - 1)
    by0 = max(0, min(item[1] for item in found) - 1)
    bx1 = min(roi.shape[1], max(item[2] for item in found) + 1)
    by1 = min(roi.shape[0], max(item[3] for item in found) + 1)
    crop = Image.fromarray(roi[by0:by1, bx0:bx1], "RGBA")
    return crop, {"x": x0 + bx0, "y": y0 + by0, "width": bx1 - bx0, "height": by1 - by0}


def pixel_roi(box: dict[str, float], canvas: dict[str, int], size: tuple[int, int]) -> tuple[int, int, int, int]:
    """Convert an already validated source-layer box to bounded stored pixels."""
    width, height = size
    x0 = max(0, min(width - 1, int(np.floor(box["x"] / canvas["width"] * width))))
    y0 = max(0, min(height - 1, int(np.floor(box["y"] / canvas["height"] * height))))
    x1 = max(x0 + 1, min(width, int(np.ceil((box["x"] + box["width"]) / canvas["width"] * width))))
    y1 = max(y0 + 1, min(height, int(np.ceil((box["y"] + box["height"]) / canvas["height"] * height))))
    return x0, y0, x1, y1


def refine_roi(roi: tuple[int, int, int, int], bodies: list[tuple[int, int, int, int]], size: tuple[int, int]) -> tuple[int, int, int, int]:
    """Snap approximate model boxes to bounded intersecting foreground bodies."""
    x0, y0, x1, y1 = roi
    area = (x1 - x0) * (y1 - y0)
    selected = []
    for bx0, by0, bx1, by1 in bodies:
        body_area = (bx1 - bx0) * (by1 - by0)
        overlap = max(0, min(x1, bx1) - max(x0, bx0)) * max(0, min(y1, by1) - max(y0, by0))
        if body_area >= 16 and overlap / body_area >= 0.55 and body_area <= area * 2.5:
            selected.append((bx0, by0, bx1, by1))
    if not selected:
        return roi
    if all(b[0] >= x0 and b[1] >= y0 and b[2] <= x1 and b[3] <= y1 for b in selected):
        return roi
    # Retain semitransparent antialiasing/shadow near the visible core. The
    # final semantic crop still uses original alpha and adds one safety pixel.
    halo = 4
    return (max(0, min(x0, min(b[0] for b in selected) - halo)),
            max(0, min(y0, min(b[1] for b in selected) - halo)),
            min(size[0], max(x1, max(b[2] for b in selected) + halo)),
            min(size[1], max(y1, max(b[3] for b in selected) + halo)))


def match_effect_box(crop: Image.Image, source_box: dict[str, int], source_size: tuple[int, int], target: dict[str, float], canvas: dict[str, int], effect: Image.Image, native_text_boxes: list[dict[str, float]] | None = None) -> tuple[dict[str, float], dict[str, Any]]:
    """Refine approximate model geometry against the actual effect without deforming sprites."""
    factor = min(1.0, 240 / effect.width, 240 / effect.height)
    small_size = (max(1, round(effect.width * factor)), max(1, round(effect.height * factor)))
    pixels = np.asarray(effect.resize(small_size, Image.Resampling.BILINEAR).convert("RGB"), dtype=np.float32)
    text_mask = np.zeros((small_size[1], small_size[0]), dtype=bool)
    for box in native_text_boxes or []:
        x0, y0, x1, y1 = pixel_roi(box, canvas, small_size)
        text_mask[y0:y1, x0:x1] = True
    sx, sy = small_size[0] / canvas["width"], small_size[1] / canvas["height"]
    predicted = (target["x"] * sx, target["y"] * sy)
    original = (source_box["x"] / source_size[0] * small_size[0], source_box["y"] / source_size[1] * small_size[1])
    radius = max(6, round(max(small_size) * 0.08))
    best = None
    for scale in [0.8, 0.9, 1.0, 1.1, 1.2]:
        w = max(2, round(crop.width / source_size[0] * small_size[0] * scale))
        h = max(2, round(crop.height / source_size[1] * small_size[1] * scale))
        if w >= small_size[0] or h >= small_size[1]:
            continue
        sample = np.asarray(crop.resize((w, h), Image.Resampling.BILINEAR), dtype=np.float32)
        yy, xx = np.where(sample[:, :, 3] >= 180)
        if len(xx) < 12:
            continue
        stride = max(1, len(xx) // 320)
        xx, yy = xx[::stride], yy[::stride]
        colors = sample[yy, xx, :3]
        left = max(0, round(min(predicted[0], original[0]) - radius))
        top = max(0, round(min(predicted[1], original[1]) - radius))
        right = min(small_size[0] - w, round(max(predicted[0], original[0]) + radius))
        bottom = min(small_size[1] - h, round(max(predicted[1], original[1]) + radius))
        if right < left or bottom < top:
            continue
        gx, gy = np.meshgrid(np.arange(left, right+1), np.arange(top, bottom+1))
        xs, ys = gx.ravel(), gy.ravel()
        # Bounded batches avoid a source-dependent image-size memory spike.
        for start in range(0, len(xs), 256):
            bx, by = xs[start:start+256], ys[start:start+256]
            delta = np.abs(pixels[by[:, None]+yy, bx[:, None]+xx] - colors)
            keep = ~text_mask[by[:, None]+yy, bx[:, None]+xx]
            support = keep.sum(axis=1)
            # The effect contains Label overlays absent from a correct blank UI
            # source. Compare only non-text pixels, retaining majority support.
            loss = (np.minimum(delta, 90).mean(axis=2) * keep).sum(axis=1) / np.maximum(support, 1)
            loss[support < max(12, len(xx) * .55)] = np.inf
            # A small locality preference resolves repeated identical controls.
            score = loss + np.hypot(bx-predicted[0], by-predicted[1]) * 0.025 + abs(scale - 1) * 3
            index = int(np.argmin(score))
            value = (float(score[index]), float(loss[index]), int(bx[index]), int(by[index]), w, h, scale, int(support[index]), len(xx))
            if best is None or value[0] < best[0]:
                best = value
    if best is None or best[1] > 42:
        return target, {"method": "observation", "reason": "no-local-pixel-correspondence"}
    _, loss, x, y, w, h, scale, retained_samples, sample_count = best
    return {"x": round(x/sx, 6), "y": round(y/sy, 6), "width": round(w/sx, 6), "height": round(h/sy, 6)}, {
        "method": "local-alpha-template", "meanClippedColorError": round(loss, 3), "scale": scale,
        "retainedSamples": retained_samples, "sampleCount": sample_count,
        "nativeTextOcclusionExcluded": retained_samples < sample_count,
    }


def analyze_semantic_crops(ui_image: Image.Image, observation: dict[str, Any], canvas: dict[str, int], text_image: Image.Image | None = None, effect_image: Image.Image | None = None, native_text_boxes: list[dict[str, float]] | None = None) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Extract source ROIs while retaining target layout and independent loss facts."""
    mask = np.asarray(ui_image)[:, :, 3] > 8
    claimed = np.zeros(mask.shape, dtype=bool)
    crops: list[dict[str, Any]] = []
    errors: list[str] = []
    warnings: list[str] = []
    seen: dict[tuple[Any, ...], str] = {}
    bodies = components(np.asarray(ui_image)[:, :, 3] >= 96)
    for node in observation["nodes"]:
        if node["role"] not in {"sprite", "button", "artistic-text"} or node.get("sourceLayer") == "background":
            continue
        key = node["semanticKey"]
        source = node.get("sourceBox")
        art_in_text = node["role"] == "artistic-text" and node.get("sourceLayer") == "text" and text_image is not None
        source_image = text_image if art_in_text else ui_image
        source_mask = np.asarray(source_image)[:, :, 3] > 8
        if node.get("visualStatus") != "visible" or (node.get("sourceLayer") != "ui" and not art_in_text) or not source:
            errors.append(f"UI_SEMANTIC_SOURCE_UNRESOLVED:{key}")
            continue
        original_roi = pixel_roi(source, canvas, source_image.size)
        roi = refine_roi(original_roi, components(np.asarray(source_image)[:, :, 3] >= 96) if art_in_text else bodies, source_image.size)
        if roi != original_roi:
            warnings.append(f"UI_SOURCE_ROI_SNAPPED:{key}")
        x0, y0, x1, y1 = roi
        source_identity = (node.get("sourceLayer"), *roi)
        if source_identity in seen:
            warnings.append(f"UI_SEMANTIC_SOURCE_DUPLICATE:{key}:{seen[source_identity]}")
        seen[source_identity] = key
        # A foreground run continuing across the ROI proves truncation. This is
        # a local boundary fact, not a semantic/visual quality score.
        visible = np.asarray(source_image)[:, :, 3] >= 96
        clipped = (x0 > 0 and np.any(visible[y0:y1, x0] & visible[y0:y1, x0 - 1])) \
            or (x1 < visible.shape[1] and np.any(visible[y0:y1, x1 - 1] & visible[y0:y1, x1])) \
            or (y0 > 0 and np.any(visible[y0, x0:x1] & visible[y0 - 1, x0:x1])) \
            or (y1 < visible.shape[0] and np.any(visible[y1 - 1, x0:x1] & visible[y1, x0:x1]))
        if clipped:
            warnings.append(f"UI_SEMANTIC_CROP_TRUNCATED:{key}")
        refined_source = {"x": x0 / source_image.width * canvas["width"], "y": y0 / source_image.height * canvas["height"],
                          "width": (x1-x0) / source_image.width * canvas["width"], "height": (y1-y0) / source_image.height * canvas["height"]}
        crop, source_box = semantic_crop(source_image, {**node, "sourceBox": refined_source}, canvas)
        if crop is None:
            errors.append(f"UI_SEMANTIC_CROP_EMPTY:{key}")
            continue
        if not art_in_text:
            claimed[y0:y1, x0:x1] |= source_mask[y0:y1, x0:x1]
        target = node["box"]
        if any(abs(source[field] - target[field]) > 2 for field in ["x", "y", "width", "height"]):
            warnings.append(f"UI_SOURCE_LAYOUT_REMAPPED:{key}")
        local_x = source_box["x"] / source_image.width * canvas["width"]
        local_y = source_box["y"] / source_image.height * canvas["height"]
        target_box = {
            "x": round(target["x"] + (local_x - source["x"]) / source["width"] * target["width"], 9),
            "y": round(target["y"] + (local_y - source["y"]) / source["height"] * target["height"], 9),
            "width": round(source_box["width"] / source_image.width * canvas["width"] / source["width"] * target["width"], 9),
            "height": round(source_box["height"] / source_image.height * canvas["height"] / source["height"] * target["height"], 9),
        }
        alignment = {"method": "observation"}
        if effect_image is not None:
            target_box, alignment = match_effect_box(crop, source_box, source_image.size, target_box, canvas, effect_image, native_text_boxes)
            if alignment["method"] == "local-alpha-template":
                warnings.append(f"UI_TARGET_PIXEL_ALIGNED:{key}")
        crops.append({"node": node, "image": crop, "sourceBox": source_box, "targetBox": target_box, "alignment": alignment})
    unclaimed = mask & ~claimed
    # Ignore the one-pixel outer frame and isolated alpha speckles, but retain
    # every remaining connected region as inspectable evidence.
    unclaimed[[0, -1], :] = False
    unclaimed[:, [0, -1]] = False
    regions = []
    for x0, y0, x1, y1 in components(unclaimed):
        pixels = int(unclaimed[y0:y1, x0:x1].sum())
        if pixels >= 16 and x1 - x0 > 1 and y1 - y0 > 1:
            regions.append({"x": x0, "y": y0, "width": x1-x0, "height": y1-y0, "visiblePixels": pixels})
    if regions:
        warnings.append("UI_UNMAPPED_FOREGROUND")
    return crops, {"errors": sorted(set(errors)), "warnings": sorted(set(warnings)),
                   "unmappedRegionCount": len(regions), "unmappedRegions": regions[:128],
                   "visiblePixels": int(mask.sum()), "mappedPixels": int((mask & claimed).sum())}


def without_edge_separator(image: Image.Image) -> Image.Image:
    """Remove only nearly full-span dark separator remnants at quadrant edges."""
    pixels = np.array(image)
    rgb = pixels[:, :, :3].astype(np.int16)
    dark = (rgb.max(axis=2) < 100) & (rgb.max(axis=2)-rgb.min(axis=2) < 35) & (pixels[:, :, 3] > 80)
    for x in list(range(min(4, image.width))) + list(range(max(0, image.width-4), image.width)):
        if float(dark[:, x].mean()) >= 0.7:
            pixels[dark[:, x], x, 3] = 0
    for y in list(range(min(4, image.height))) + list(range(max(0, image.height-4), image.height)):
        if float(dark[y].mean()) >= 0.7:
            pixels[y, dark[y], 3] = 0
    return Image.fromarray(pixels, "RGBA")


def native_label_evidence(intent: dict[str, Any], observation: dict[str, Any]) -> list[dict[str, Any]]:
    """Native text consumes frozen characters and observed effect geometry, not glyph pixels."""
    semantics = {item["semanticKey"]: item for item in intent.get("elements", [])}
    visible = set(observation.get("layerAudit", {}).get("effectVisibleLabels", []))
    canvas = intent["canvas"]
    result = []
    for node in observation["nodes"]:
        semantic = semantics.get(node["semanticKey"], {})
        box = node.get("box", {})
        if (node.get("role") != "label" or semantic.get("role") != "label"
                or node.get("visualStatus") != "visible" or node["semanticKey"] not in visible
                or not node.get("text") or node["text"] != semantic.get("text")
                or not all(isinstance(box.get(key), (int, float)) and np.isfinite(box[key]) for key in ["x", "y", "width", "height"])
                or min(box["x"], box["y"]) < 0 or min(box["width"], box["height"]) <= 1
                or box["x"] + box["width"] > canvas["width"] or box["y"] + box["height"] > canvas["height"]):
            continue
        result.append({"semanticKey": node["semanticKey"], "nodeId": node["id"],
                       "targetBox": dict(box), "method": "native-label-from-effect"})
    return result


def isolate_ordinary_ui_text(image: Image.Image, observation: dict[str, Any], canvas: dict[str, int],
                             labels: list[dict[str, Any]]) -> tuple[Image.Image, list[dict[str, Any]]]:
    """Exclude complete audited text islands; never erase pixels inside a graphic source ROI."""
    pixels = np.array(image)
    foreground = pixels[:, :, 3] > 8
    islands = components(foreground, with_spans=True)
    protected = np.zeros(foreground.shape, dtype=bool)
    for node in observation["nodes"]:
        if node.get("role") in {"sprite", "button", "artistic-text"} and node.get("sourceLayer") == "ui" and node.get("sourceBox"):
            x0, y0, x1, y1 = pixel_roi(node["sourceBox"], canvas, image.size)
            protected[y0:y1, x0:x1] = True
    available = {item["semanticKey"] for item in labels}
    removed = np.zeros(foreground.shape, dtype=bool)
    records = []
    for issue in observation.get("layerAudit", {}).get("issues", []):
        if issue.get("code") != "ordinary-in-ui" or issue.get("quadrant") != "ui" or issue.get("semanticKey") not in available:
            continue
        region = issue.get("region")
        if not region:
            continue
        x0, y0, x1, y1 = pixel_roi(region, canvas, image.size)
        # A two-pixel allowance includes the alpha fringe around a measured glyph.
        x0, y0, x1, y1 = max(0, x0-2), max(0, y0-2), min(image.width, x1+2), min(image.height, y1+2)
        selected = np.zeros(foreground.shape, dtype=bool)
        count = 0
        for (left, top, right, bottom), spans in islands:
            pixels_in_region = sum(max(0, min(end, x1) - max(start, x0)) for row, start, end in spans if y0 <= row < y1)
            component_pixels = sum(end - start for _, start, end in spans)
            # Audit rectangles identify text, not an exact alpha contour. Retain
            # whole-component ownership when most pixels belong to that region;
            # attached decorative trim is removed with the replaced native text.
            if (pixels_in_region < component_pixels * .5
                    or (right-left) * (bottom-top) > (x1-x0) * (y1-y0) * 3):
                continue
            if any(protected[row, start:end].any() for row, start, end in spans):
                continue
            for row, start, end in spans:
                selected[row, start:end] = True
            count += 1
        # Partial removal cannot resolve the audit: touching/overlapping artwork
        # stays intact and the original issue remains blocking.
        if count and not (foreground[y0:y1, x0:x1] & ~selected[y0:y1, x0:x1]).any():
            removed |= selected
            records.append({"semanticKey": issue["semanticKey"], "sourceRegion": dict(region),
                            "componentCount": count, "removedPixels": int(selected.sum()),
                            "method": "isolated-ordinary-text-components"})
    pixels[removed, 3] = 0
    return Image.fromarray(pixels), records


def has_thumbnail_coordinates(observation: dict[str, Any]) -> bool:
    """A batch-wide scale discrepancy identifies mixed preview/canvas units."""
    ratios = [node["box"]["width"] / node["sourceBox"]["width"] for node in observation["nodes"]
              if node.get("sourceLayer") == "ui" and node.get("sourceBox") and node["sourceBox"]["width"] > 0]
    return len(ratios) >= 6 and 1.6 < float(np.median(ratios)) < 3.0


def physical_ui_groups(ui_image: Image.Image, observation: dict[str, Any], canvas: dict[str, int], effect: Image.Image, native_text_boxes: list[dict[str, float]] | None = None) -> list[dict[str, Any]]:
    """Keep connected raster artwork whole and map semantic controls to its group."""
    ui_image = without_edge_separator(ui_image)
    pixels = np.asarray(ui_image)
    core = pixels[:, :, 3] >= 96
    regions = [(box, spans) for box, spans in components(core, with_spans=True)
               if box[2]-box[0] >= 3 and box[3]-box[1] >= 3 and sum(x1-x0 for _, x0, x1 in spans) >= 32]
    bodies = [box for box, _ in regions]
    members: dict[int, list[str]] = {i: [] for i in range(len(bodies))}
    thumbnail_coordinates = has_thumbnail_coordinates(observation)
    for node in observation["nodes"]:
        if node.get("sourceLayer") != "ui" or node["role"] not in {"sprite", "button", "artistic-text"} or not node.get("sourceBox"):
            continue
        if bodies:
            target = node["box"] if thumbnail_coordinates else node["sourceBox"]
            rx0, ry0, rx1, ry1 = pixel_roi(target, canvas, ui_image.size)
            selected = []
            roi_pixels = int(core[ry0:ry1, rx0:rx1].sum())
            for i, (bx0, by0, bx1, by1) in enumerate(bodies):
                overlap = max(0, min(rx1, bx1)-max(rx0, bx0)) * max(0, min(ry1, by1)-max(ry0, by0))
                owned_pixels = sum(max(0, min(right, rx1)-max(left, rx0))
                                   for row, left, right in regions[i][1] if ry0 <= row < ry1)
                # The ROI can contain multiple bodies or be one small control
                # inside a larger connected body. Both directions need actual
                # foreground support; a bounding-box hole owns no pixels.
                if (owned_pixels >= 32 and owned_pixels >= roi_pixels * .5
                        and overlap >= (rx1-rx0) * (ry1-ry0) * .5) or (
                        owned_pixels >= 32 and overlap >= (bx1-bx0) * (by1-by0) * .5):
                    selected.append(i)
            for index in selected:
                members[index].append(node["semanticKey"])
    # One semantic source may contain several disconnected parts. Merge those
    # parts before publishing, so none are duplicated as unrelated decorations.
    clusters = [{i} for i in range(len(bodies))]
    for key in {key for values in members.values() for key in values}:
        linked = [cluster for cluster in clusters if any(key in members[i] for i in cluster)]
        if len(linked) > 1:
            merged = set().union(*linked)
            clusters = [cluster for cluster in clusters if cluster not in linked] + [merged]
    combined = []
    combined_members = {}
    for cluster in sorted(clusters, key=min):
        bounds = [bodies[i] for i in cluster]
        bounds = (min(b[0] for b in bounds), min(b[1] for b in bounds), max(b[2] for b in bounds), max(b[3] for b in bounds))
        combined_members[len(combined)] = sorted({key for i in cluster for key in members[i]})
        combined.append((bounds, [span for i in cluster for span in regions[i][1]]))
    regions, members = combined, combined_members
    bodies = [box for box, _ in regions]
    result = []
    for i, (x0, y0, x1, y1) in enumerate(bodies):
        x0, y0, x1, y1 = max(0,x0-4), max(0,y0-4), min(ui_image.width,x1+4), min(ui_image.height,y1+4)
        box = {"x": x0, "y": y0, "width": x1-x0, "height": y1-y0}
        own = np.zeros((y1-y0, x1-x0), dtype=np.uint8)
        for row, left, right in regions[i][1]:
            own[row-y0, left-x0:right-x0] = 255
        halo = np.asarray(Image.fromarray(own).filter(ImageFilter.MaxFilter(9))) > 0
        # Bounding rectangles can enclose another disconnected icon. Keep only
        # this component and its antialiased halo, never the enclosed artwork.
        halo &= ~core[y0:y1, x0:x1] | (own > 0)
        rgba = np.array(ui_image.crop((x0,y0,x1,y1)))
        rgba[:, :, 3] = np.where(halo, rgba[:, :, 3], 0)
        crop = Image.fromarray(rgba, "RGBA")
        target = {"x": x0/ui_image.width*canvas["width"], "y": y0/ui_image.height*canvas["height"],
                  "width": (x1-x0)/ui_image.width*canvas["width"], "height": (y1-y0)/ui_image.height*canvas["height"]}
        authorities = [node for node in observation["nodes"] if node["semanticKey"] in members[i]]
        if authorities:
            # The material sheet can be rearranged. Source geometry is never the
            # target authority once the corresponding effect nodes are known.
            left = min(node["box"]["x"] for node in authorities)
            top = min(node["box"]["y"] for node in authorities)
            target = {"x": left, "y": top,
                      "width": max(node["box"]["x"] + node["box"]["width"] for node in authorities) - left,
                      "height": max(node["box"]["y"] + node["box"]["height"] for node in authorities) - top}
        refined, alignment = match_effect_box(crop, box, ui_image.size, target, canvas, effect, native_text_boxes)
        if authorities and (alignment.get("meanClippedColorError", 0) > 20
                            or abs(refined["x"] + refined["width"]/2 - target["x"] - target["width"]/2) > target["width"] * .25
                            or abs(refined["y"] + refined["height"]/2 - target["y"] - target["height"]/2) > target["height"] * .25
                            or not .75 <= refined["width"] / target["width"] <= 1.33
                            or not .75 <= refined["height"] / target["height"] <= 1.33):
            alignment = {"method": "observation", "reason": "semantic-target-preserved"}
        else:
            target = refined
        key = f"visual-region-{i+1:03d}"
        result.append({"node": {"semanticKey": key, "role": "sprite"}, "image": crop,
                       "sourceBox": box, "targetBox": target, "alignment": alignment, "groupMembers": members[i]})
    return result


def text_line_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    """Group transparent glyphs by shared rows and bounded word gaps, without OCR."""
    mask = np.asarray(without_edge_separator(image))[:, :, 3] >= 96
    boxes = []
    for y0, y1 in contiguous_runs(np.flatnonzero(mask.sum(axis=1) > 0)):
        if y1-y0 < 4:
            continue
        groups: list[list[int]] = []
        for x0, x1 in contiguous_runs(np.flatnonzero(mask[y0:y1].sum(axis=0) > 0)):
            if groups and x0-groups[-1][1] < (y1-y0)*1.2:
                groups[-1][1] = x1
            else:
                groups.append([x0, x1])
        boxes.extend((x0,y0,x1,y1) for x0,x1 in groups if x1-x0 >= 5 and y1-y0 >= 6
                     and int(mask[y0:y1,x0:x1].sum()) >= 16)
    return boxes


def ordered_text_pairs(labels: list[dict[str, Any]], boxes: list[tuple[int, int, int, int]]) -> dict[int, int]:
    """Use matching reading-order rows only when both sides have the same row shape."""
    def rows(values: list[tuple[int, float, float, float]]) -> list[list[int]]:
        grouped: list[list[tuple[int, float, float, float]]] = []
        for value in sorted(values, key=lambda item: item[2]):
            if grouped and abs(value[2] - np.median([item[2] for item in grouped[-1]])) <= max(value[3], np.median([item[3] for item in grouped[-1]])) * .7:
                grouped[-1].append(value)
            else:
                grouped.append([value])
        return [[item[0] for item in sorted(row, key=lambda item: item[1])] for row in grouped]
    source_rows = rows([(i, (b[0]+b[2])/2, (b[1]+b[3])/2, b[3]-b[1]) for i,b in enumerate(boxes)])
    target_rows = rows([(i, n['box']['x']+n['box']['width']/2, n['box']['y']+n['box']['height']/2, n['box']['height']) for i,n in enumerate(labels)])
    if len(target_rows) < 3 or [len(row) for row in target_rows] != [len(row) for row in source_rows]:
        return {}
    return {i:j for target,source in zip(target_rows,source_rows) for i,j in zip(target,source)}


def align_label_layouts(text_image: Image.Image, effect: Image.Image, observation: dict[str, Any], groups: list[dict[str, Any]], canvas: dict[str, int], allow_free_matching: bool = True) -> dict[str, Any]:
    """Local glyph correspondence refines geometry; Intent remains text authority."""
    labels = [node for node in observation["nodes"] if node["role"] == "label"]
    boxes = text_line_boxes(text_image)
    if not boxes or not labels:
        return {}
    nodes = {node["id"]: node for node in observation["nodes"]}
    pairs = []
    for i, node in enumerate(labels):
        b = node["box"]
        for j,(x0,y0,x1,y1) in enumerate(boxes):
            distance = ((b["x"]+b["width"]/2)/canvas["width"]-(x0+x1)/2/text_image.width)**2 + ((b["y"]+b["height"]/2)/canvas["height"]-(y0+y1)/2/text_image.height)**2
            pairs.append((distance,i,j))
    ordered = ordered_text_pairs(labels, boxes)
    assigned = dict(ordered); used = set(assigned.values())
    for distance,i,j in sorted(pairs):
        if i not in assigned and j not in used and distance < 0.12:
            assigned[i] = j; used.add(j)
    factor = min(1.0, 500/max(effect.size))
    sw,sh = max(1,round(effect.width*factor)),max(1,round(effect.height*factor))
    gray = np.asarray(effect.resize((sw,sh)).convert("L"),dtype=np.float32)
    layouts = {}
    for i,j in assigned.items():
        node = labels[i]; x0,y0,x1,y1 = boxes[j]
        alpha = text_image.getchannel("A").crop((max(0,x0-3),max(0,y0-3),min(text_image.width,x1+3),min(text_image.height,y1+3)))
        px=(x0-3)/text_image.width*sw; py=(y0-3)/text_image.height*sh
        parent = nodes.get(node.get("parentId"))
        if parent and parent["role"] == "button":
            pb=parent["box"]; nb=node["box"]
            cx=(x0+x1)/2/text_image.width*canvas["width"]; cy=(y0+y1)/2/text_image.height*canvas["height"]
            candidates=[group for group in groups if 0.3 < group["targetBox"]["width"]*group["targetBox"]["height"]/(pb["width"]*pb["height"]) < 3]
            known=[group for group in candidates if parent["semanticKey"] in group["groupMembers"]]
            if known and (not ordered or not has_thumbnail_coordinates(observation)):
                candidates=known
                cx=pb["x"]+pb["width"]/2; cy=pb["y"]+pb["height"]/2
            if candidates:
                group=min(candidates,key=lambda g:(g["targetBox"]["x"]+g["targetBox"]["width"]/2-cx)**2+(g["targetBox"]["y"]+g["targetBox"]["height"]/2-cy)**2)
                gb=group["targetBox"]
                relative_x=(nb["x"]+nb["width"]/2-pb["x"])/pb["width"]
                relative_y=(nb["y"]+nb["height"]/2-pb["y"])/pb["height"]
                if (-.1 <= relative_x <= 1.1 and -.1 <= relative_y <= 1.2
                        and np.hypot(gb["x"]+gb["width"]/2-cx,gb["y"]+gb["height"]/2-cy)<max(canvas["width"],canvas["height"])*.2):
                    sx=gb["width"]/pb["width"]; sy=gb["height"]/pb["height"]
                    box={"x":gb["x"]+(nb["x"]-pb["x"])*sx,"y":gb["y"]+(nb["y"]-pb["y"])*sy,
                         "width":nb["width"]*sx,"height":nb["height"]*sy}
                    layouts[parent["id"]]={"targetBox":gb,"method":"caption-parent-region","groupSemanticKey":group["node"]["semanticKey"]}
                    layouts[node["id"]]={"targetBox":box,"fontSize":max(1,node.get("labelStyle",{}).get("fontSize",24)*min(sx,sy)),"method":"button-relative-caption"}
            # Text rendering may differ from the raster font. Do not search the
            # surrounding scenery for a coincidentally similar glyph pattern.
            continue
        if not ordered and not allow_free_matching:
            continue
        best=None
        text_color=node.get("labelStyle",{}).get("color","#FFFFFF")
        if not re.fullmatch(r"#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?",text_color): text_color="#FFFFFF"
        polarity=1 if sum(int(text_color[k:k+2],16) for k in (1,3,5))>=384 else -1
        for scale in [.65,.8,1.0,1.15,1.3]:
            w=max(2,round(alpha.width/text_image.width*sw*scale)); h=max(2,round(alpha.height/text_image.height*sh*scale))
            if w>=sw or h>=sh: continue
            arr=np.asarray(alpha.resize((w,h)),dtype=np.float32)/255
            arr-=arr.mean(); norm=float(np.sqrt((arr*arr).sum()))
            if norm<.1:continue
            yy,xx=np.indices(arr.shape); yy=yy.ravel();xx=xx.ravel();template=arr.ravel()/norm
            # Bound sample memory and preserve equal positive/negative evidence.
            stride=max(1,len(xx)//640); yy=yy[::stride];xx=xx[::stride];template=template[::stride];template-=template.mean();template/=max(.0001,float(np.sqrt((template*template).sum())))
            left=max(0,round(px-sw*.18));right=min(sw-w,round(px+sw*.18));top=max(0,round(py-sh*.17));bottom=min(sh-h,round(py+sh*.17))
            if right<left or bottom<top:continue
            gx,gy=np.meshgrid(np.arange(left,right+1),np.arange(top,bottom+1));xs=gx.ravel();ys=gy.ravel()
            for start in range(0,len(xs),128):
                bx=xs[start:start+128];by=ys[start:start+128];values=gray[by[:,None]+yy,bx[:,None]+xx];values-=values.mean(axis=1,keepdims=True)
                corr=polarity*(values*template).sum(axis=1)/np.maximum(1,np.sqrt((values*values).sum(axis=1)))
                score=corr-np.hypot(bx-px,by-py)*.0008; idx=int(np.argmax(score))
                candidate=(float(score[idx]),float(corr[idx]),int(bx[idx]),int(by[idx]),w,h)
                if best is None or candidate[0]>best[0]:best=candidate
        if best and best[1] >= .5:
            _,correlation,x,y,w,h=best
            box={"x":x/sw*canvas["width"],"y":y/sh*canvas["height"],"width":w/sw*canvas["width"],"height":h/sh*canvas["height"]}
            layouts[node["id"]]={"targetBox":box,"fontSize":max(1,box["height"]*.9),"method":"local-glyph-template","correlation":round(correlation,4),"sourceBox":{"x":x0,"y":y0,"width":x1-x0,"height":y1-y0}}
    # Keep the corrected control and its graphic descendants in one physical
    # group so moving/anchoring the Button moves its actual image as well.
    for key, layout in list(layouts.items()):
        if "groupSemanticKey" not in layout:
            continue
        member_keys = set()
        for candidate in observation["nodes"]:
            if candidate["role"] not in {"sprite", "button", "artistic-text"}:
                continue
            current=candidate; visited=set()
            while current and current["id"] not in visited:
                if current["id"]==key:
                    member_keys.add(candidate["semanticKey"]);break
                visited.add(current["id"]);current=nodes.get(current.get("parentId"))
        for group in groups:
            group["groupMembers"][:]=[member for member in group["groupMembers"] if member not in member_keys]
            if group["node"]["semanticKey"]==layout["groupSemanticKey"]:
                group["groupMembers"].extend(sorted(member_keys))
    return layouts


def generation_evidence(input_value: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """保留有界 Provider 事实和原顺序告警，不持有原始响应。"""
    generation = input_value.get("generation") if isinstance(input_value.get("generation"), dict) else {}
    raw_generation_warnings = generation.get("warnings") if isinstance(generation.get("warnings"), list) else []
    generation_warnings = [
        item[:500] if re.match(r"^[A-Z][A-Z0-9_]{2,120}(?::|$)", item)
        else f"UI_IMAGE_PROVIDER_WARNING:{item[:470]}"
        for item in raw_generation_warnings[:128] if isinstance(item, str) and item
    ]
    request_profile = generation.get("requestProfile") if isinstance(generation.get("requestProfile"), dict) else {}
    generation_facts = {
        "providerId": str(generation.get("providerId", ""))[:128],
        "modelId": str(generation.get("modelId", ""))[:160],
        "capabilityVersion": str(generation.get("capabilityVersion", ""))[:160],
        "requestedCount": int(generation.get("requestedCount", 0)),
        "actualCount": int(generation.get("actualCount", 0)),
        "completionStatus": str(generation.get("completionStatus", ""))[:32],
        "requestProfile": {
            key: request_profile[key] for key in (
                "resolution", "aspectRatio", "width", "height", "quality", "referenceMode"
            ) if key in request_profile and isinstance(request_profile[key], (str, int, float))
        },
        "referenceRequested": bool(input_value.get("referenceUiImageAttached", False)),
        "warnings": generation_warnings,
    }
    return generation_facts, generation_warnings


def read_composite_image(client: Any, composite_handle: dict[str, Any]) -> Image.Image:
    """在分割和发布前验证唯一源图的字节、帧数与像素预算。"""
    mounted = client.call("openInputMount", {"handle": composite_handle})
    source_path = client.resolve_attempt_path(mounted["relativePath"])
    if source_path.stat().st_size > MAX_INPUT_BYTES:
        raise RuntimeError("UI_EXTRACTION_SOURCE_TOO_LARGE")
    with Image.open(source_path) as opened:
        if getattr(opened, "n_frames", 1) != 1:
            raise RuntimeError("UI_EXTRACTION_MULTIFRAME_UNSUPPORTED")
        if opened.width * opened.height > MAX_PIXELS or opened.width < 4 or opened.height < 4:
            raise RuntimeError("UI_EXTRACTION_PIXEL_BUDGET_INVALID")
        with python_warnings.catch_warnings():
            python_warnings.simplefilter("error", Image.DecompressionBombWarning)
            opened.load()
            composite = opened.convert("RGBA")
    return composite


def split_composite_quadrants(composite: Image.Image) -> tuple[Any, Any, Any, Any]:
    """按既有分隔线证据切出四区，原始画布和像素均不重采样。"""
    array = np.array(composite, dtype=np.uint8)
    vertical = detect_band(array, "vertical")
    horizontal = detect_band(array, "horizontal")
    x0, x1 = vertical["start"], vertical["end"]
    y0, y1 = horizontal["start"], horizontal["end"]
    if min(x0, composite.width - x1, y0, composite.height - y1) <= 0:
        raise RuntimeError("UI_EXTRACTION_DEGENERATE_QUADRANT")
    boxes = {
        "effect": (0, 0, x0, y0),
        "background": (x1, 0, composite.width, y0),
        "ui": (0, y1, x0, composite.height),
        "text": (x1, y1, composite.width, composite.height),
    }
    quadrants = {name: composite.crop(box).convert("RGBA") for name, box in boxes.items()}
    return vertical, horizontal, boxes, quadrants


def process_lower_layers(client: Any, composite_handle: dict[str, Any], intent: dict[str, Any],
                         observation: dict[str, Any], quadrants: dict[str, Image.Image], boxes: dict[str, Any],
                         source: list[dict[str, Any]], retention_days: int) -> tuple[Any, Any, Any, Any]:
    """顺序处理 ui/text，只有已验证结果或可接纳候选才替换本次 quadrants。"""
    raw_handles = {name: publish_image(client, quadrants[name], f"game-agent.ui-{ 'elements' if name == 'ui' else 'text'}-quadrant/v2", source, f"raw-{name}", retention_days) for name in ["ui", "text"]}
    processing = {}
    candidate_layers = {}
    alpha_warnings = []
    for name in ["ui", "text"]:
        box = boxes[name]
        roles = {"sprite", "button", "artistic-text"} if name == "ui" else {"label"}
        elements = [item for item in intent.get("elements", []) if item.get("role") in roles]
        observed = [item for item in observation.get("nodes", []) if item.get("role") in roles]
        processed = client.process_image({
            "version": 1, "operation": "remove-solid-background", "source": composite_handle,
            "region": {"x": box[0], "y": box[1], "width": box[2]-box[0], "height": box[3]-box[1]},
            "background": {"rgb": [255, 0, 255], "keyColorIsBackground": intent.get("transparencyFallback", {}).get("keyColorIsBackground") is True},
            "allowEmpty": not elements and not observed,
        })
        if (processed["status"] != "ready"
                and processed.get("summary", {}).get("reasons") == ["SUSPICIOUS_SOURCE_ALPHA"]):
            recovered = recover_native_alpha_noise(quadrants[name])
            if recovered is not None:
                recovered_handle = publish_image(client, recovered, f"game-agent.ui-{'elements' if name == 'ui' else 'text'}-quadrant/v2",
                    source + [raw_handles[name], processed["report"]], f"alpha-recovered-{name}", retention_days)
                verified = client.process_image({
                    "version": 1, "operation": "remove-solid-background", "source": recovered_handle,
                    "background": {"rgb": [255, 0, 255], "keyColorIsBackground": False},
                    "allowEmpty": not elements and not observed,
                })
                verified["sourceAlphaRecovery"] = {"method": "bounded-native-alpha-endpoints",
                    "low": 16, "high": 240, "originalReport": processed["report"], "derivedImage": recovered_handle}
                processed = verified
                if processed["status"] == "ready":
                    alpha_warnings.append(f"UI_NATIVE_ALPHA_NOISE_RECOVERED:{name}")
        processing[name] = processed
        if processed["status"] == "review_required" and processed.get("candidateImage") and processed.get("summary", {}).get("reasons") == ["FOREGROUND_ESTIMATE_UNCERTAIN"]:
            report_mount = client.call("openInputMount", {"handle": processed["report"]})
            report = json.loads(client.resolve_attempt_path(report_mount["relativePath"]).read_text())
            candidate_mount = client.call("openInputMount", {"handle": processed["candidateImage"]})
            with Image.open(client.resolve_attempt_path(candidate_mount["relativePath"])) as opened:
                candidate = opened.convert("RGBA")
            evidence = candidate_raster_evidence(quadrants[name], candidate, report)
            if evidence:
                quadrants[name] = candidate
                candidate_layers[name] = {**evidence, "candidateDigest": processed["candidateImage"]["digest"],
                                          "reportDigest": processed["report"]["digest"]}
                alpha_warnings.append(f"UI_MATTING_CANDIDATE_USED:{name}")
        if processed["status"] == "ready":
            mount = client.call("openInputMount", {"handle": processed["image"]})
            with Image.open(client.resolve_attempt_path(mount["relativePath"])) as opened:
                quadrants[name] = opened.convert("RGBA")
        elif name not in candidate_layers:
            alpha_warnings.append(f"UI_ALPHA_REVIEW_REQUIRED:{name}")
    return raw_handles, processing, candidate_layers, alpha_warnings


def collect_semantic_crops(quadrants: dict[str, Image.Image], raster_observation: dict[str, Any],
                           intent: dict[str, Any], native_labels: list[dict[str, Any]],
                           alpha_ready: bool, usable_layers: set[str]) -> tuple[Any, Any, Any]:
    """在可用图层上进行语义裁片与物理分组，保留完整性诊断的原始次序。"""
    if alpha_ready:
        safe_ui = quadrants["ui"] if "ui" in usable_layers else Image.new("RGBA", quadrants["ui"].size)
        safe_text = quadrants["text"] if "text" in usable_layers else None
        native_text_boxes = [item["targetBox"] for item in native_labels]
        extracted, integrity = analyze_semantic_crops(safe_ui, raster_observation, intent["canvas"], safe_text, quadrants["effect"], native_text_boxes)
        groups = physical_ui_groups(safe_ui, raster_observation, intent["canvas"], quadrants["effect"], native_text_boxes)
    else:
        # An opaque checkerboard is not a single usable foreground group.
        extracted, groups = [], []
        integrity = {"errors": [], "warnings": [], "coverage": {}}

    if groups:
        recovered = {key for group in groups for key in group["groupMembers"]}
        extracted = groups + [item for item in extracted if item["node"].get("sourceLayer") == "text"]
        integrity["warnings"] = [value for value in integrity["warnings"] if not value.startswith("UI_SEMANTIC_CROP_TRUNCATED:")]
        integrity["errors"] = [value for value in integrity["errors"] if not (value.startswith("UI_SEMANTIC_CROP_EMPTY:") and value.split(":",1)[1] in recovered)]
        integrity["warnings"].extend(f"UI_SEMANTIC_GROUPED:{key}" for group in groups if len(group["groupMembers"]) > 1 for key in group["groupMembers"])
        for group in groups:
            if not group["groupMembers"]:
                integrity["warnings"].append(f"UI_VISIBLE_REGION_PRESERVED:{group['node']['semanticKey']}")
    return extracted, groups, integrity


def build_extraction_review(input_value: dict[str, Any], manifest: dict[str, Any],
                            manifest_artifact: dict[str, Any]) -> dict[str, Any]:
    """只从本次 Manifest 组装 Review，不另读图像或重新计算发布结论。"""
    observation = input_value["observation"]
    composite_handle = manifest["source"]
    raw_handles, processing = manifest["rawQuadrants"], manifest["imageProcessing"]
    quadrant_handles = {name: value["artifact"] for name, value in manifest["quadrants"].items()}
    preview_handle, overlay_handle = manifest["previewArtifact"], manifest["separatorOverlayArtifact"]
    vertical, horizontal = manifest["separator"]["vertical"], manifest["separator"]["horizontal"]
    crops, errors = manifest["crops"], manifest["errors"]
    expected_crop_nodes = [node for node in observation["nodes"]
                           if node["role"] in {"sprite", "button", "artistic-text"}
                           and node.get("visualStatus") == "visible" and node.get("sourceLayer") == "ui"]
    review = {
        "schema": "game-agent.workflow-artifact-review-manifest/v1", "schemaVersion": 1,
        "title": "UI 四象限拆分与语义切图",
        "pages": [
            {"id": "processing", "title": "原始下层与公共抠图", "kind": "alpha", "items": [
                {"id": f"raw-{name}", "label": f"raw {name}", "role": "source", "artifact": handle} for name, handle in raw_handles.items()
            ] + [
                {"id": f"{name}-{key}", "label": f"{name} {key}", "role": key, "artifact": value[key]}
                for name, value in processing.items() for key in ["image", "candidateImage", "report"] if key in value
            ]},
            {"id": "quadrants", "title": "四象限", "kind": "image", "items": [
                {"id": "composite", "label": "original composite", "role": "ui-four-quadrant-composite", "artifact": composite_handle},
            ] + [
                {"id": name, "label": name, "role": f"ui-{name}", "artifact": quadrant_handles[name]}
                for name in ["effect", "background", "ui", "text"]
            ]},
            {"id": "diagnostics", "title": "分隔线与重建", "kind": "overlay", "items": [
                {"id": "separator", "label": "separator overlay", "role": "ui-separator-overlay", "artifact": overlay_handle},
                {"id": "preview", "label": "layer alignment preview", "role": "ui-deterministic-preview", "artifact": preview_handle},
            ]},
            {"id": "crops", "title": "UI 元素切图", "kind": "alpha", "items": [
                {"id": item["semanticKey"], "label": item["semanticKey"], "role": item["role"], "artifact": item["artifact"]}
                for item in crops
            ]},
            {"id": "structure", "title": "Observation 与提取清单", "kind": "hierarchy", "items": [
                {"id": "observation", "label": "UI Observation Tree V2", "role": "ui-observation-tree", "artifact": input_value["observationArtifact"]},
                {"id": "extraction", "label": "Quadrant Extraction Manifest V2", "role": "ui-extraction-manifest", "artifact": manifest_artifact},
            ]},
        ],
        "metrics": [
            {"name": "separator.vertical.confidence", "value": vertical["confidence"], "threshold": 0.3, "passed": vertical["confidence"] >= 0.3},
            {"name": "separator.horizontal.confidence", "value": horizontal["confidence"], "threshold": 0.3, "passed": horizontal["confidence"] >= 0.3},
            {
                "name": "semantic.crops",
                "value": len(crops),
                "threshold": len(expected_crop_nodes),
                "passed": len(crops) == len(expected_crop_nodes),
            },
        ],
        "hardFailures": [{"code": code.split(":", 1)[0], "message": code} for code in errors],
    }
    return review


def main() -> None:
    sdk_root = Path.cwd() / ".workflow-sdk"
    sys.path.insert(0, str(sdk_root))
    from context_client import create_workflow_script_context_client  # type: ignore

    input_value = read_stdin()
    artifacts = input_value.get("compositeArtifacts")
    if not isinstance(artifacts, list) or len(artifacts) != 1:
        raise RuntimeError("UI_EXTRACTION_COMPOSITE_COUNT_INVALID")
    composite_handle = artifacts[0]
    observation = input_value["observation"]
    intent = input_value["intent"]
    generation_facts, generation_warnings = generation_evidence(input_value)
    retention_days = int(input_value.get("retentionDays", 7))
    client = create_workflow_script_context_client()
    composite = read_composite_image(client, composite_handle)
    vertical, horizontal, boxes, quadrants = split_composite_quadrants(composite)
    effect_crops = effect_source_crops(quadrants["effect"], observation, intent)
    effect_keys = {item["node"]["semanticKey"] for item in effect_crops}
    raster_observation = {**observation, "nodes": [node for node in observation["nodes"] if node["semanticKey"] not in effect_keys]}
    source = [composite_handle, input_value["observationArtifact"], input_value["intentArtifact"]]
    raw_handles, processing, candidate_layers, alpha_warnings = process_lower_layers(
        client, composite_handle, intent, observation, quadrants, boxes, source, retention_days)
    ui_alpha_provenance = processing["ui"]["summary"]["method"]
    text_alpha_provenance = processing["text"]["summary"]["method"]
    native_labels = native_label_evidence(intent, observation)
    raster_layers = sorted({node["sourceLayer"] for node in observation["nodes"]
                            if node.get("role") in {"sprite", "button", "artistic-text"}
                            and node.get("sourceLayer") in {"ui", "text"} and node["semanticKey"] not in effect_keys})
    isolated_text = []
    usable_layers = {name for name in processing if processing[name]["status"] == "ready" or name in candidate_layers}
    if "ui" in usable_layers:
        quadrants["ui"], isolated_text = isolate_ordinary_ui_text(quadrants["ui"], observation, intent["canvas"], native_labels)
    reconstruction = {"version": 1, "publicationPolicy": "prefab-usability-v1", "nativeLabels": native_labels,
                      "rasterLayers": raster_layers, "isolatedText": isolated_text, "candidateLayers": candidate_layers, "effectSources": []}
    warnings = list(alpha_warnings) + generation_warnings
    warnings.extend(f"UI_ORDINARY_TEXT_ISOLATED:{item['semanticKey']}" for item in isolated_text)
    if vertical["fallback"]: warnings.append("UI_SEPARATOR_VERTICAL_CENTER_FALLBACK")
    if horizontal["fallback"]: warnings.append("UI_SEPARATOR_HORIZONTAL_CENTER_FALLBACK")
    source = [composite_handle, input_value["observationArtifact"], input_value["intentArtifact"]]
    quadrant_handles: dict[str, dict[str, Any]] = {}
    schema_by_name = {
        "effect": "game-agent.ui-effect-quadrant/v2",
        "background": "game-agent.ui-background-quadrant/v2",
        "ui": "game-agent.ui-elements-quadrant/v2",
        "text": "game-agent.ui-text-quadrant/v2",
    }
    for name in ["effect", "background", "ui", "text"]:
        derived = ([processing[name]["image"], processing[name]["report"]] if name in processing and processing[name]["status"] == "ready"
                   else [processing[name]["candidateImage"], processing[name]["report"]] if name in candidate_layers else [])
        quadrant_handles[name] = publish_image(client, quadrants[name], schema_by_name[name], source + derived, name, retention_days)
    x0, x1 = vertical["start"], vertical["end"]
    y0, y1 = horizontal["start"], horizontal["end"]
    target_size = quadrants["effect"].size
    preview = quadrants["background"].resize(target_size, Image.Resampling.LANCZOS)
    preview.alpha_composite(quadrants["ui"].resize(target_size, Image.Resampling.LANCZOS))
    preview.alpha_composite(quadrants["text"].resize(target_size, Image.Resampling.LANCZOS))
    preview_handle = publish_image(client, preview, "game-agent.ui-layer-preview/v2", source + list(quadrant_handles.values()), "preview", retention_days)
    overlay = composite.copy()
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((max(0, x0 - 1), 0, min(composite.width - 1, max(x0, x1)), composite.height - 1), outline=(255, 0, 0, 255), width=2)
    draw.rectangle((0, max(0, y0 - 1), composite.width - 1, min(composite.height - 1, max(y0, y1))), outline=(255, 0, 0, 255), width=2)
    overlay_handle = publish_image(client, overlay, "game-agent.ui-separator-overlay/v2", source, "separator-overlay", retention_days)
    crops: list[dict[str, Any]] = []
    alpha_ready = all(name in usable_layers for name in raster_layers)
    extracted, groups, integrity = collect_semantic_crops(
        quadrants, raster_observation, intent, native_labels, alpha_ready, usable_layers)
    warnings.extend(integrity["warnings"])
    extracted.extend(effect_crops)
    for item in extracted:
        node, crop, source_box = item["node"], item["image"], item["sourceBox"]
        source_layer = item.get("sourceLayer", node.get("sourceLayer", "ui"))
        handle = publish_image(client, crop, "game-agent.ui-element-crop/v2", source + [quadrant_handles[source_layer]], node["semanticKey"], retention_days)
        target_box = item["targetBox"]
        crops.append({
            "semanticKey": node["semanticKey"], "role": node["role"], "artifact": handle,
            "sourceBox": source_box, "targetBox": target_box, "padding": 1,
            "alignment": item["alignment"],
            **({"groupMembers": item["groupMembers"]} if "groupMembers" in item else {}),
            "grouped": "groupMembers" in item or node.get("extraction", {}).get("groupPolicy") == "group",
        })
        if source_layer == "effect":
            reconstruction["effectSources"].append({"semanticKey": node["semanticKey"], "method": item["alignment"]["method"],
                "effectDigest": quadrant_handles["effect"]["digest"], "cropDigest": handle["digest"],
                "targetBox": target_box, "excludedNodeIds": item["alignment"]["excludedNodeIds"]})
            warnings.append(f"UI_EFFECT_SOURCE_RECOVERED:{node['semanticKey']}")
    mixed_coordinates = has_thumbnail_coordinates(observation)
    node_layouts = align_label_layouts(quadrants["text"], quadrants["effect"], observation, groups, intent["canvas"], mixed_coordinates) if alpha_ready and processing["text"]["status"] == "ready" else {}
    for item in native_labels:
        # Native geometry remains usable even when an unrelated raster layer
        # fails. Alpha readiness only governs raster extraction and publication.
        node_layouts[item["nodeId"]] = {"targetBox": dict(item["targetBox"]), "method": item["method"]}
    if mixed_coordinates: warnings.append("UI_THUMBNAIL_COORDINATES_RECOVERED")
    warnings.extend(f"UI_PIXEL_LAYOUT_REFINED:{key}" for key in node_layouts)
    status = input_value.get("observationStatus", "ready")
    errors = sorted(set(list(observation.get("errors", [])) + integrity["errors"]))
    recovered_errors = {f"UI_OBSERVATION_SOURCE_UNRESOLVED:{key}" for key in effect_keys}
    errors = [error for error in errors if error not in recovered_errors]
    if effect_keys and not errors and alpha_ready:
        status = "ready_with_warnings"
    if errors or not alpha_ready:
        status = "review_only"
    if status != "review_only" and warnings:
        status = "ready_with_warnings"
    manifest = {
        "schema": "game-agent.ui-quadrant-extraction-manifest/v2", "schemaVersion": 2,
        "source": composite_handle,
        "canvas": intent["canvas"],
        "separator": {"vertical": vertical, "horizontal": horizontal},
        "transform": {
            name: {
                "sourceRect": {"x": box[0], "y": box[1], "width": box[2] - box[0], "height": box[3] - box[1]},
                "targetRect": {"x": 0, "y": 0, "width": intent["canvas"]["width"], "height": intent["canvas"]["height"]},
                "scaleX": intent["canvas"]["width"] / (box[2] - box[0]),
                "scaleY": intent["canvas"]["height"] / (box[3] - box[1]),
            } for name, box in boxes.items()
        },
        "quadrants": {name: {"artifact": quadrant_handles[name], "width": quadrants[name].width, "height": quadrants[name].height} for name in quadrant_handles},
        "rawQuadrants": raw_handles, "imageProcessing": processing,
        "alphaProvenance": {"ui": ui_alpha_provenance, "text": text_alpha_provenance},
        "crops": crops, "nodeLayouts": node_layouts, "reconstruction": reconstruction,
        "previewArtifact": preview_handle,
        "separatorOverlayArtifact": overlay_handle,
        "generation": generation_facts,
        "integrity": integrity,
        "warnings": sorted(set(warnings)), "errors": errors, "status": status,
    }
    manifest_artifact = publish_json(client, manifest, "game-agent.ui-quadrant-extraction-manifest/v2", source + list(quadrant_handles.values()), retention_days)
    review = build_extraction_review(input_value, manifest, manifest_artifact)
    review_artifact = publish_json(client, review, "game-agent.workflow-artifact-review-manifest/v1", source + [manifest_artifact, preview_handle, overlay_handle] + [item["artifact"] for item in crops], retention_days)
    print(json.dumps({
        "manifest": manifest, "manifestArtifact": manifest_artifact, "reviewArtifact": review_artifact,
        "status": status, "warnings": sorted(set(warnings)), "publicationAllowed": status in {"ready", "ready_with_warnings"},
    }, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
