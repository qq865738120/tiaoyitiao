"""Fixed JSON process entry. Paths are supplied only by the trusted host adapter."""
from __future__ import annotations

import hashlib
import io
import json
import struct
from pathlib import Path
import sys
import time
import warnings

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from PIL import Image, ImageCms, PngImagePlugin
from matting import remove_background


class ProcessingError(Exception):
    """Expose only bounded stable product codes."""


def digest(path: Path) -> str:
    """Hash without retaining a second encoded image buffer."""
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def main() -> None:
    """Decode once, compute in isolation and return only validated output facts."""
    started = time.monotonic()
    request = json.loads(sys.stdin.buffer.read(65537))
    if not isinstance(request, dict) or set(request) != {"sourcePath", "sourceDigest", "outputDirectory", "options", "closureDigest"}:
        raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
    root = Path(__file__).resolve().parent
    profile = json.loads((root / "profile.json").read_text())
    options = request["options"]
    if not isinstance(options, dict) or type(options.get("version")) is not int or set(options) - {"version", "operation", "background", "allowEmpty", "region"} or options.get("version") != 1 or options.get("operation") != "remove-solid-background":
        raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
    background = options.get("background")
    if not isinstance(background, dict) or set(background) != {"rgb", "keyColorIsBackground"} or type(background["keyColorIsBackground"]) is not bool or ("allowEmpty" in options and type(options["allowEmpty"]) is not bool):
        raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
    key = background.get("rgb")
    if not isinstance(key, list) or len(key) != 3 or any(type(c) is not int or c < 0 or c > 255 for c in key):
        raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
    source = Path(request["sourcePath"])
    destination = Path(request["outputDirectory"])
    if not source.is_file() or source.is_symlink() or not destination.is_dir() or destination.is_symlink():
        raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
    if source.stat().st_size > profile["maxBytes"]:
        raise ProcessingError("IMAGE_PROCESSING_BUDGET_EXCEEDED")
    source_digest = digest(source)
    if source_digest != request["sourceDigest"]:
        raise ProcessingError("IMAGE_PROCESSING_SOURCE_CHANGED")
    Image.MAX_IMAGE_PIXELS = profile["maxPixels"]
    warnings.simplefilter("error", Image.DecompressionBombWarning)
    with Image.open(source) as opened:
        if opened.format not in {"PNG", "JPEG", "WEBP"} or getattr(opened, "n_frames", 1) != 1:
            raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
        if max(opened.size) > profile["maxEdge"] or opened.width * opened.height > profile["maxPixels"]:
            raise ProcessingError("IMAGE_PROCESSING_BUDGET_EXCEEDED")
        rectangle = options.get("region", {"x": 0, "y": 0, "width": opened.width, "height": opened.height})
        if not isinstance(rectangle, dict) or set(rectangle) != {"x", "y", "width", "height"} or any(type(v) is not int for v in rectangle.values()):
            raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
        x, y, width, height = (rectangle[k] for k in ("x", "y", "width", "height"))
        if x < 0 or y < 0 or width <= 0 or height <= 0 or x + width > opened.width or y + height > opened.height:
            raise ProcessingError("IMAGE_PROCESSING_INVALID_INPUT")
        if opened.width * opened.height * 12 + width * height * 8 + 96 * 1024 ** 2 > profile["maxWorkingBytes"]:
            raise ProcessingError("IMAGE_PROCESSING_BUDGET_EXCEEDED")
        image = opened.crop((x, y, x + width, y + height)).convert("RGBA")
        source_format = opened.format
        color_info = {k: opened.info[k] for k in ("gamma", "srgb", "chromaticity") if k in opened.info}
        icc = opened.info.get("icc_profile")
        if icc and image.getchannel("A").getextrema() == (255, 255):
            try:
                image = ImageCms.profileToProfile(image, ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile("sRGB"), outputMode="RGBA")
                icc = image.info.get("icc_profile")
            except (ValueError, OSError, ImageCms.PyCMSError):
                result, report = None, {"status": "review_required", "method": "none", "reasons": ["COLOR_PROFILE_UNSUPPORTED"], "width": width, "height": height}
            else:
                result, report = remove_background(np.asarray(image), options, profile)
        else:
            result, report = remove_background(np.asarray(image), options, profile)
    if digest(source) != source_digest:
        raise ProcessingError("IMAGE_PROCESSING_SOURCE_CHANGED")
    report.update(schema="game-agent.image-processing-report/v1", schemaVersion=1,
                  sourceDigest=source_digest, sourceFormat=source_format, region=rectangle, closureDigest=request["closureDigest"],
                  profileDigest=hashlib.sha256((root / "profile.json").read_bytes()).hexdigest(),
                  lockDigest=hashlib.sha256((root / "requirements.lock").read_bytes()).hexdigest(),
                  algorithmVersion=profile["version"], durationMs=round((time.monotonic() - started) * 1000))
    output = {"status": report["status"], "summary": {k: report[k] for k in ("method", "width", "height", "algorithmVersion", "reasons")}, "reportFile": "report.json"}
    if result is not None:
        name = "image.png" if report["status"] == "ready" else "candidate.png"
        out = Image.fromarray(result)
        pnginfo = PngImagePlugin.PngInfo()
        if report["method"] == "native-alpha":
            if "gamma" in color_info: pnginfo.add(b"gAMA", struct.pack(">I", round(color_info["gamma"]*100000)))
            if "srgb" in color_info: pnginfo.add(b"sRGB", bytes([color_info["srgb"]]))
            if "chromaticity" in color_info: pnginfo.add(b"cHRM", struct.pack(">8I", *(round(v*100000) for v in color_info["chromaticity"])))
        out.save(destination / name, format="PNG", pnginfo=pnginfo, **({"icc_profile": icc} if icc else {}))
        with Image.open(destination / name) as verify:
            verify.verify()
        output["imageFile" if report["status"] == "ready" else "candidateFile"] = name
        output["imageDigest"] = digest(destination / name)
    (destination / "report.json").write_text(json.dumps(report, ensure_ascii=False, allow_nan=False), encoding="utf-8")
    output["reportDigest"] = digest(destination / "report.json")
    sys.stdout.write(json.dumps(output, allow_nan=False))


if __name__ == "__main__":
    try:
        main()
    except ProcessingError as error:
        sys.stderr.write(str(error))
        sys.exit(1)
    except (Image.DecompressionBombError, Image.DecompressionBombWarning, MemoryError):
        sys.stderr.write("IMAGE_PROCESSING_BUDGET_EXCEEDED")
        sys.exit(1)
    except Exception:
        sys.stderr.write("IMAGE_PROCESSING_INVALID_INPUT")
        sys.exit(1)
