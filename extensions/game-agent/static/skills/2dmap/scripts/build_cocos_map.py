#!/usr/bin/env python3
"""Build Cocos Creator 3.8 compatible TMX/TSX or layered-map handoffs."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

REQUEST_SCHEMA = "game-agent.cocos-2dmap-build/v1"
REPORT_SCHEMA = "game-agent.cocos-2dmap-report/v1"
MAX_INPUT_BYTES = 32 * 1024 * 1024
MAX_OUTPUT_BYTES = 64 * 1024 * 1024
MAX_PIXELS = 16_777_216
DEFAULT_PIXEL_PALETTE_COLORS = 64
DEFAULT_PIXEL_ALPHA_THRESHOLD = 128
DEFAULT_SOURCE_GRID_FIDELITY_MIN = 0.5
DEFAULT_SOURCE_GRID_COLOR_TOLERANCE = 16


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


def save_png(image: Image.Image, path: Path) -> dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=False, compress_level=9)
    return {"sha256": sha256(path), "bytes": path.stat().st_size, "width": image.width, "height": image.height}


def xml_write(root: ET.Element, path: Path) -> None:
    ET.indent(root, space="  ")
    tree = ET.ElementTree(root)
    path.parent.mkdir(parents=True, exist_ok=True)
    tree.write(path, encoding="utf-8", xml_declaration=True)


def object_group(parent: ET.Element, name: str, objects: list[dict[str, Any]], map_pixels: tuple[int, int]) -> None:
    group = ET.SubElement(parent, "objectgroup", {"name": name})
    for index, item in enumerate(objects, start=1):
        x, y = float(item.get("x", 0)), float(item.get("y", 0))
        width, height = float(item.get("width", 0)), float(item.get("height", 0))
        if x < 0 or y < 0 or x + width > map_pixels[0] or y + height > map_pixels[1]:
            fail("OBJECT_OUTSIDE_MAP", group=name, index=index)
        attributes = {"id": str(index), "name": str(item.get("name", f"{name}-{index}")), "type": str(item.get("type", item.get("kind", ""))), "x": str(x), "y": str(y)}
        if width: attributes["width"] = str(width)
        if height: attributes["height"] = str(height)
        node = ET.SubElement(group, "object", attributes)
        properties = item.get("properties") or {}
        if properties:
            props = ET.SubElement(node, "properties")
            for key in sorted(properties):
                ET.SubElement(props, "property", {"name": str(key), "value": str(properties[key])})


def extruded_tileset(source: Image.Image, tile_width: int, tile_height: int, output: Path) -> tuple[dict[str, Any], int, int]:
    if source.width % tile_width or source.height % tile_height:
        fail("TILESET_GRID_NOT_DIVISIBLE")
    columns, rows = source.width // tile_width, source.height // tile_height
    tile_count = columns * rows
    margin, spacing, extrusion = 1, 2, 1
    atlas_width = margin * 2 + columns * tile_width + (columns - 1) * spacing
    atlas_height = margin * 2 + rows * tile_height + (rows - 1) * spacing
    atlas = Image.new("RGBA", (atlas_width, atlas_height), (0, 0, 0, 0))
    for index in range(tile_count):
        source_x = (index % columns) * tile_width
        source_y = (index // columns) * tile_height
        tile = source.crop((source_x, source_y, source_x + tile_width, source_y + tile_height))
        x = margin + (index % columns) * (tile_width + spacing)
        y = margin + (index // columns) * (tile_height + spacing)
        atlas.alpha_composite(tile, (x, y))
        atlas.paste(tile.crop((0, 0, tile_width, 1)), (x, y - extrusion))
        atlas.paste(tile.crop((0, tile_height - 1, tile_width, tile_height)), (x, y + tile_height))
        atlas.paste(tile.crop((0, 0, 1, tile_height)), (x - extrusion, y))
        atlas.paste(tile.crop((tile_width - 1, 0, tile_width, tile_height)), (x + tile_width, y))
    return save_png(atlas, output), columns, tile_count


def normalize_pixel_palette(image: Image.Image, pixel_art: Any, integer_scale_factor: int) -> tuple[Image.Image, dict[str, Any]]:
    pixel_config = pixel_art or {}
    if not isinstance(pixel_config, dict):
        fail("PIXEL_ART_CONFIG_INVALID")
    palette_colors = int(pixel_config.get("paletteColors", DEFAULT_PIXEL_PALETTE_COLORS))
    alpha_threshold = int(pixel_config.get("alphaThreshold", DEFAULT_PIXEL_ALPHA_THRESHOLD))
    if palette_colors < 2 or palette_colors > 256:
        fail("PIXEL_PALETTE_INVALID", paletteColors=palette_colors)
    if alpha_threshold < 1 or alpha_threshold > 254:
        fail("PIXEL_ALPHA_THRESHOLD_INVALID", alphaThreshold=alpha_threshold)
    source_pixels = list(image.convert("RGBA").getdata())
    alpha_values = [255 if pixel[3] >= alpha_threshold else 0 for pixel in source_pixels]
    rgb = Image.new("RGB", image.size)
    rgb.putdata([(pixel[0], pixel[1], pixel[2]) if alpha else (0, 0, 0) for pixel, alpha in zip(source_pixels, alpha_values)])
    quantized = rgb.quantize(colors=palette_colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    quantized_pixels = list(quantized.getdata())
    normalized = Image.new("RGBA", image.size)
    normalized.putdata([
        (pixel[0], pixel[1], pixel[2], alpha) if alpha else (0, 0, 0, 0)
        for pixel, alpha in zip(quantized_pixels, alpha_values)
    ])
    opaque_colours = len({pixel for pixel, alpha in zip(quantized_pixels, alpha_values) if alpha})
    return normalized, {
        "resample": "nearest" if integer_scale_factor != 1 else "identity",
        "integerScaleRequired": True,
        "integerScaleFactor": integer_scale_factor,
        "paletteColorsRequested": palette_colors,
        "opaqueColorCount": opaque_colours,
        "paletteDither": False,
        "alphaThreshold": alpha_threshold,
        "semiTransparentPixels": 0,
    }


def source_grid_fidelity(
    cells: list[Image.Image],
    target: tuple[int, int],
    pixel_art: Any,
) -> dict[str, Any]:
    pixel_config = pixel_art or {}
    if not isinstance(pixel_config, dict):
        fail("PIXEL_ART_CONFIG_INVALID")
    alpha_threshold = int(pixel_config.get("alphaThreshold", DEFAULT_PIXEL_ALPHA_THRESHOLD))
    minimum = float(pixel_config.get("sourceGridFidelityMin", DEFAULT_SOURCE_GRID_FIDELITY_MIN))
    colour_tolerance = int(pixel_config.get("sourceGridColorTolerance", DEFAULT_SOURCE_GRID_COLOR_TOLERANCE))
    if not (0.0 <= minimum <= 1.0):
        fail("PIXEL_SOURCE_GRID_FIDELITY_MIN_INVALID", value=minimum)
    if colour_tolerance < 0 or colour_tolerance > 255:
        fail("PIXEL_SOURCE_GRID_COLOR_TOLERANCE_INVALID", value=colour_tolerance)
    scores: list[float] = []
    for cell in cells:
        rebuilt = cell.resize(target, Image.Resampling.NEAREST).resize(cell.size, Image.Resampling.NEAREST)
        actual = np.asarray(cell.convert("RGBA"), dtype=np.uint8)
        expected = np.asarray(rebuilt.convert("RGBA"), dtype=np.uint8)
        actual_opaque = actual[:, :, 3] >= alpha_threshold
        expected_opaque = expected[:, :, 3] >= alpha_threshold
        subject = actual_opaque | expected_opaque
        if not bool(subject.any()):
            fail("EMPTY_TILE_ALPHA")
        alpha_matches = actual_opaque == expected_opaque
        colour_delta = np.max(
            np.abs(actual[:, :, :3].astype(np.int16) - expected[:, :, :3].astype(np.int16)),
            axis=2,
        )
        matches = alpha_matches & (~actual_opaque | (colour_delta <= colour_tolerance))
        scores.append(float(matches[subject].mean()))
    evidence = {
        "method": "nearest-roundtrip-subject-v1",
        "minimumRequired": minimum,
        "colorTolerance": colour_tolerance,
        "tileScores": [round(score, 6) for score in scores],
        "minimumScore": round(min(scores), 6),
        "meanScore": round(sum(scores) / len(scores), 6),
    }
    if min(scores) < minimum:
        fail("PIXEL_SOURCE_GRID_FIDELITY_LOW", evidence=evidence)
    return evidence


def normalize_tileset_source(
    source: Image.Image,
    tile_width: int,
    tile_height: int,
    source_grid: Any,
    pixel_art: Any,
) -> tuple[Image.Image, dict[str, Any]]:
    """Convert a Provider-native grid into the authoritative target tile grid."""
    if source.width * source.height > MAX_PIXELS:
        fail("PIXEL_BUDGET_EXCEEDED")
    if source_grid is None:
        if source.width % tile_width or source.height % tile_height:
            fail("TILESET_GRID_NOT_DIVISIBLE")
        native_tile_count = (source.width // tile_width) * (source.height // tile_height)
        if native_tile_count > 256:
            fail("SOURCE_GRID_REQUIRED", nativeTileCount=native_tile_count)
        normalized, pixel_evidence = normalize_pixel_palette(source, pixel_art, 1)
        return normalized, {
            "mode": "native-target-grid",
            "sourceSize": [source.width, source.height],
            "targetTileSize": [tile_width, tile_height],
            "tileCount": native_tile_count,
            "pixelArt": pixel_evidence,
        }
    if not isinstance(source_grid, dict):
        fail("SOURCE_GRID_INVALID")
    columns = int(source_grid.get("columns", 0))
    rows = int(source_grid.get("rows", 0))
    count = int(source_grid.get("count", columns * rows))
    if columns < 1 or rows < 1 or count < 1 or count > columns * rows or count > 256:
        fail("SOURCE_GRID_INVALID")
    if source.width % columns or source.height % rows:
        fail("SOURCE_GRID_NOT_DIVISIBLE", width=source.width, height=source.height)
    cell_width, cell_height = source.width // columns, source.height // rows
    if cell_width % tile_width or cell_height % tile_height:
        fail("PIXEL_SCALE_NOT_INTEGER", sourceCellSize=[cell_width, cell_height], targetTileSize=[tile_width, tile_height])
    scale_x, scale_y = cell_width // tile_width, cell_height // tile_height
    if scale_x != scale_y:
        fail("PIXEL_SCALE_NOT_UNIFORM", sourceCellSize=[cell_width, cell_height], targetTileSize=[tile_width, tile_height])
    output_rows = int(math.ceil(count / columns))
    normalized = Image.new("RGBA", (columns * tile_width, output_rows * tile_height), (0, 0, 0, 0))
    cells: list[Image.Image] = []
    for index in range(count):
        source_x = (index % columns) * cell_width
        source_y = (index // columns) * cell_height
        cell = source.crop((source_x, source_y, source_x + cell_width, source_y + cell_height))
        cells.append(cell)
        tile = cell.resize((tile_width, tile_height), Image.Resampling.NEAREST)
        normalized.alpha_composite(tile, ((index % columns) * tile_width, (index // columns) * tile_height))
    grid_fidelity = source_grid_fidelity(cells, (tile_width, tile_height), pixel_art)
    normalized, pixel_evidence = normalize_pixel_palette(normalized, pixel_art, scale_x)
    pixel_evidence["sourceGridFidelity"] = grid_fidelity
    return normalized, {
        "mode": "provider-grid-normalized",
        "sourceSize": [source.width, source.height],
        "sourceGrid": {"columns": columns, "rows": rows, "count": count},
        "sourceCellSize": [cell_width, cell_height],
        "targetTileSize": [tile_width, tile_height],
        "normalizedSize": [normalized.width, normalized.height],
        "resample": "nearest",
        "pixelArt": pixel_evidence,
    }


def build_tile_mode(request: dict[str, Any], run_root: Path, source: Path, output_root: Path) -> tuple[list[dict[str, Any]], dict[str, Any], Path]:
    tile_width, tile_height = [int(value) for value in request["tileSize"]]
    if tile_width < 1 or tile_height < 1:
        fail("TILE_SIZE_INVALID")
    with Image.open(source) as opened:
        opened.load()
        image = opened.convert("RGBA")
    image, source_normalization = normalize_tileset_source(
        image,
        tile_width,
        tile_height,
        request.get("sourceGrid"),
        request.get("pixelArt"),
    )
    tileset_path = output_root / "tileset.png"
    tileset_info, columns, tile_count = extruded_tileset(image, tile_width, tile_height, tileset_path)
    map_width, map_height = [int(value) for value in request["mapSize"]]
    layer_data = request.get("layerData") or [1] * (map_width * map_height)
    if len(layer_data) != map_width * map_height or any(not isinstance(gid, int) or gid < 0 or gid > tile_count for gid in layer_data):
        fail("LAYER_DATA_INVALID")
    tsx = ET.Element("tileset", {
        "version": "1.10", "tiledversion": "1.10.2", "name": "game-agent-tileset",
        "tilewidth": str(tile_width), "tileheight": str(tile_height), "tilecount": str(tile_count),
        "columns": str(columns), "margin": "1", "spacing": "2",
    })
    ET.SubElement(tsx, "image", {"source": "tileset.png", "width": str(tileset_info["width"]), "height": str(tileset_info["height"])})
    tsx_path = output_root / "tileset.tsx"
    xml_write(tsx, tsx_path)
    tmx = ET.Element("map", {
        "version": "1.10", "tiledversion": "1.10.2", "orientation": "orthogonal", "renderorder": "right-down",
        "width": str(map_width), "height": str(map_height), "tilewidth": str(tile_width), "tileheight": str(tile_height),
        "infinite": "0", "nextlayerid": "5", "nextobjectid": "1000",
    })
    ET.SubElement(tmx, "tileset", {"firstgid": "1", "source": "tileset.tsx"})
    layer = ET.SubElement(tmx, "layer", {"id": "1", "name": "terrain", "width": str(map_width), "height": str(map_height)})
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    for row in range(map_height):
        writer.writerow(layer_data[row * map_width:(row + 1) * map_width])
    ET.SubElement(layer, "data", {"encoding": "csv"}).text = buffer.getvalue().strip()
    map_pixels = (map_width * tile_width, map_height * tile_height)
    object_group(tmx, "collision", list(request.get("collision", [])), map_pixels)
    object_group(tmx, "spawns", list(request.get("spawns", [])), map_pixels)
    object_group(tmx, "zones", list(request.get("zones", [])), map_pixels)
    tmx_path = output_root / "map.tmx"
    xml_write(tmx, tmx_path)
    # Cocos-compatible round-trip checks: external TSX, CSV cardinality, image geometry and named groups.
    parsed_map = ET.parse(tmx_path).getroot()
    parsed_tileset = ET.parse(tsx_path).getroot()
    external = parsed_map.find("tileset")
    data = parsed_map.find("layer/data")
    groups = [node.attrib.get("name") for node in parsed_map.findall("objectgroup")]
    csv_values = [int(value.strip()) for value in (data.text or "").replace("\n", ",").split(",") if value.strip()]
    roundtrip = external is not None and external.attrib.get("source") == "tileset.tsx" and len(csv_values) == map_width * map_height and groups == ["collision", "spawns", "zones"] and parsed_tileset.attrib.get("margin") == "1" and parsed_tileset.attrib.get("spacing") == "2"
    if not roundtrip:
        fail("TMX_TSX_ROUNDTRIP_FAILED")
    manifest = {
        "$schema": "game-agent.cocos-map-manifest/v1", "runId": request["runId"], "mode": "tile_mode",
        "cocosCreator": ">=3.8.0", "origin": "top-left", "yAxis": "down", "tileSize": [tile_width, tile_height],
        "mapSize": [map_width, map_height], "tileset": {"path": "tileset.png", "margin": 1, "spacing": 2, "extrusion": 1, "columns": columns, "tileCount": tile_count},
        "sourceNormalization": source_normalization,
        "tmx": "map.tmx", "tsx": "tileset.tsx", "objectGroups": groups, "roundtripVerified": True, "creatorVerified": False,
    }
    manifest_path = output_root / "cocos-map-manifest.json"
    write_json(manifest_path, manifest)
    outputs = [
        {"relativePath": path.relative_to(run_root).as_posix(), "packagePath": path.name, "sha256": sha256(path)}
        for path in (tileset_path, tsx_path, tmx_path, manifest_path)
    ]
    return outputs, {"passed": True, "checks": {"tmxTsxRoundtrip": True, "namedObjectGroups": groups, "tileCount": tile_count, "pixelPerfect": True, "sourceNormalization": source_normalization}}, manifest_path


def build_layered_mode(request: dict[str, Any], run_root: Path, source: Path, output_root: Path) -> tuple[list[dict[str, Any]], dict[str, Any], Path]:
    canvas = tuple(int(value) for value in request.get("canvas", [0, 0]))
    with Image.open(source) as opened:
        opened.load()
        foundation = opened.convert("RGBA")
    if canvas == (0, 0):
        canvas = foundation.size
    if canvas[0] * canvas[1] > MAX_PIXELS or foundation.size != canvas:
        fail("LAYER_CANVAS_INVALID", canvas=canvas, source=foundation.size)
    requested_layers = request.get("layers") or [{"name": "foundation", "source": str(source)}]
    allowed_order = ["foundation", "terrain", "props_back", "actors", "props_front", "foreground"]
    seen: set[str] = set()
    layer_entries: list[dict[str, Any]] = []
    outputs: list[dict[str, Any]] = []
    for layer in requested_layers:
        name = str(layer.get("name", ""))
        if name not in allowed_order or name in seen:
            fail("LAYER_NAME_INVALID", name=name)
        seen.add(name)
        layer_source = inside(run_root, Path(layer.get("source", source)))
        with Image.open(layer_source) as opened:
            opened.load()
            image = opened.convert("RGBA")
        if image.size != canvas:
            fail("LAYER_SIZE_MISMATCH", name=name)
        layer_path = output_root / "layers" / f"{name}.png"
        info = save_png(image, layer_path)
        outputs.append({"relativePath": layer_path.relative_to(run_root).as_posix(), "packagePath": f"layers/{name}.png", "sha256": info["sha256"]})
        layer_entries.append({"name": name, "path": f"layers/{name}.png", "order": allowed_order.index(name), **info})
    layer_entries.sort(key=lambda item: item["order"])
    preview = Image.new("RGBA", canvas, (0, 0, 0, 0))
    for entry in layer_entries:
        with Image.open(output_root / entry["path"]) as layer_image:
            preview.alpha_composite(layer_image.convert("RGBA"))
    preview_path = output_root / "composite-preview.png"
    preview_info = save_png(preview, preview_path)
    outputs.append({"relativePath": preview_path.relative_to(run_root).as_posix(), "packagePath": "diagnostics/composite-preview.png", "sha256": preview_info["sha256"]})
    handoff = {
        "$schema": "game-agent.cocos-layered-map/v1", "runId": request["runId"], "mode": "layered_mode",
        "cocosCreator": ">=3.8.0", "canvas": list(canvas), "origin": "top-left", "yAxis": "down", "units": "pixels",
        "layers": layer_entries, "placements": request.get("placements", []), "collision": request.get("collision", []),
        "spawns": request.get("spawns", []), "zones": request.get("zones", []), "occluders": request.get("occluders", []),
        "previewAuthority": False, "creatorVerified": False,
    }
    handoff_path = output_root / "cocos-layered-map.json"
    write_json(handoff_path, handoff)
    outputs.append({"relativePath": handoff_path.relative_to(run_root).as_posix(), "packagePath": "cocos-layered-map.json", "sha256": sha256(handoff_path)})
    qc = {"passed": True, "checks": {"layerCount": len(layer_entries), "consistentCanvas": True, "stableOrder": True, "previewAuthority": False}}
    return outputs, qc, handoff_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()
    request = load_json(Path(args.request))
    if request.get("schema") != REQUEST_SCHEMA:
        fail("REQUEST_SCHEMA_INVALID")
    run_root = inside(Path(request["runRoot"]), Path(request["runRoot"]))
    source = inside(run_root, Path(request["source"]))
    output_root = inside(run_root, Path(request["outputRoot"]), must_exist=False)
    report_path = inside(run_root, Path(args.report), must_exist=False)
    if source.stat().st_size > MAX_INPUT_BYTES:
        fail("INPUT_BUDGET_EXCEEDED")
    output_root.mkdir(parents=True, exist_ok=False)
    mode = request.get("mode")
    try:
        if mode == "tile_mode":
            outputs, qc, handoff_path = build_tile_mode(request, run_root, source, output_root)
        elif mode == "layered_mode":
            outputs, qc, handoff_path = build_layered_mode(request, run_root, source, output_root)
        else:
            fail("MAP_MODE_INVALID")
    except Exception:
        # Pre-output validation failures must not poison the materialized run.
        # Only an empty directory is removed; partial evidence remains fail-closed.
        try:
            output_root.rmdir()
        except OSError:
            pass
        raise
    total_bytes = sum((run_root / entry["relativePath"]).stat().st_size for entry in outputs)
    qc["checks"]["outputBytes"] = total_bytes
    qc["checks"]["withinBudget"] = total_bytes <= MAX_OUTPUT_BYTES
    qc["passed"] = bool(qc["passed"] and total_bytes <= MAX_OUTPUT_BYTES)
    if not qc["passed"]:
        fail("QC_FAILED", qc=qc)
    report = {"schema": REPORT_SCHEMA, "runId": request["runId"], "mode": mode, "sourceSha256": sha256(source), "outputs": outputs, "qc": qc, "handoffSha256": sha256(handoff_path)}
    write_json(report_path, report)
    print(json.dumps({"ok": True, "mode": mode, "report": str(report_path), "qc": qc}, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from None
