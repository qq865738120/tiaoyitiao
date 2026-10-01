#!/usr/bin/env python3
"""Deterministic, bounded UI image comparison. Never declares visual acceptance."""
import argparse
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import sys
import threading
import time
import warnings

SCHEMA = "game-agent.ui-assessment/v1"
ALGORITHM = "ui-rgb-ssim-v1"
MAX_BYTES = 32 * 1024 * 1024
MAX_PIXELS = 16_000_000
MAX_SIDE = 8192
COMPARE_SIDE = 2048
MAX_SECONDS = 60
CONFIG_KEYS = {
    "measurement_id", "reference_roi", "actual_roi", "geometry_evidence",
    "background", "expected_reference_sha256", "expected_actual_sha256", "capture",
}


class AssessmentError(Exception):
    """A classified failure; its message is bounded and contains no source bytes."""

    def __init__(self, code, stage, message, status="error"):
        super().__init__(message)
        self.code, self.stage, self.status = code, stage, status


class Parser(argparse.ArgumentParser):
    def error(self, message):
        raise AssessmentError("INVALID_ARGUMENT", "arguments", message[:500])


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def read_bytes(path, limit, stage):
    if not path.is_file():
        raise AssessmentError("INPUT_NOT_FILE", stage, "Input must be a readable regular file.")
    if path.stat().st_size > limit:
        raise AssessmentError("INPUT_LIMIT", stage, "Input exceeds the byte budget.")
    with path.open("rb") as stream:
        data = stream.read(limit + 1)
    if not data or len(data) > limit:
        raise AssessmentError("INPUT_LIMIT", stage, "Input is empty or exceeds the byte budget.")
    return data


def load_config(path):
    config = {} if not path else json.loads(read_bytes(Path(path), 32768, "configuration"))
    if not isinstance(config, dict) or set(config) - CONFIG_KEYS:
        raise AssessmentError("INVALID_CONFIG", "configuration", "Unknown configuration fields or non-object config.")
    config.setdefault("measurement_id", "full-frame-v1")
    for key in ("measurement_id", "geometry_evidence"):
        if key in config and (not isinstance(config[key], str) or not config[key].strip() or len(config[key]) > 1000):
            raise AssessmentError("INVALID_CONFIG", "configuration", f"{key} must be bounded nonempty text.")
    background = config.get("background")
    if background is not None and (not isinstance(background, list) or len(background) != 3 or
            any(type(v) is not int or not 0 <= v <= 255 for v in background)):
        raise AssessmentError("INVALID_CONFIG", "configuration", "background must be three integer sRGB values (0..255).")
    for key in ("expected_reference_sha256", "expected_actual_sha256"):
        if key in config and (not isinstance(config[key], str) or not re.fullmatch(r"[a-f0-9]{64}", config[key])):
            raise AssessmentError("INVALID_CONFIG", "configuration", f"{key} must be a SHA-256 digest.")
    capture = config.get("capture")
    if capture is not None:
        keys = {"artifact_id", "scene_uuid", "viewport", "dpr"}
        if not isinstance(capture, dict) or set(capture) != keys:
            raise AssessmentError("INVALID_CAPTURE", "configuration", "capture requires artifact_id, scene_uuid, viewport, dpr.")
        if any(not isinstance(capture[k], str) or not 1 <= len(capture[k]) <= 256 for k in ("artifact_id", "scene_uuid")):
            raise AssessmentError("INVALID_CAPTURE", "configuration", "Capture identities must be nonempty bounded text.")
        viewport = capture["viewport"]
        if not isinstance(viewport, list) or len(viewport) != 2 or any(type(v) is not int or not 1 <= v <= MAX_SIDE for v in viewport):
            raise AssessmentError("INVALID_CAPTURE", "configuration", "viewport must contain two positive pixel dimensions.")
        dpr = capture["dpr"]
        if type(dpr) not in (float, int) or not math.isfinite(dpr) or not 0 < dpr <= 8:
            raise AssessmentError("INVALID_CAPTURE", "configuration", "dpr must be finite and within (0,8].")
    return config


def load_image(path, role, config, report):
    from PIL import Image, ImageCms, ImageOps, UnidentifiedImageError
    data = read_bytes(path, MAX_BYTES, "decode")
    identity = digest(data)
    expected = config.get(f"expected_{role}_sha256")
    if expected and identity != expected:
        raise AssessmentError("SOURCE_CHANGED", "identity", f"{role} does not match the expected digest.")
    facts = {"name": path.name, "sha256": identity, "bytes": len(data), "transforms": []}
    report["inputs"][role] = facts
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as source:
                fmt = source.format
                facts.update(format=fmt, source_size=list(source.size))
                if source.width > MAX_SIDE or source.height > MAX_SIDE or source.width * source.height > MAX_PIXELS:
                    raise AssessmentError("PIXEL_LIMIT", "decode", "Image exceeds pixel or dimension limits.")
                if getattr(source, "n_frames", 1) != 1:
                    raise AssessmentError("STATIC_FRAME_REQUIRED", "decode", "Supply an explicitly selected static frame.", "not_comparable")
                if fmt not in ("PNG", "JPEG", "WEBP"):
                    raise AssessmentError("UNSUPPORTED_FORMAT", "decode", "Convert to PNG, JPEG or static WebP first.", "not_comparable")
                facts["mime"] = Image.MIME.get(fmt)
                extensions = {"PNG": {".png"}, "JPEG": {".jpg", ".jpeg"}, "WEBP": {".webp"}}
                if path.suffix.lower() not in extensions[fmt]:
                    report["warnings"].append(f"{role}: extension differs from decoded {fmt}.")
                # verify() rejects truncated PNG streams that a permissive load can accept.
                source.verify()
            with Image.open(io.BytesIO(data)) as source:
                orientation = source.getexif().get(274, 1)
                image = ImageOps.exif_transpose(source)
                image.load()
                icc = source.info.get("icc_profile")
                if orientation != 1:
                    facts["transforms"].append({"exif_orientation": orientation})
                if image.mode not in ("RGB", "RGBA", "L", "LA", "P", "CMYK"):
                    raise AssessmentError("UNSUPPORTED_COLOR_MODE", "color", "Explicitly convert this color mode before comparison.", "not_comparable")
                alpha = image.convert("RGBA").getchannel("A")
                if icc:
                    try:
                        profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
                        color = image.convert("L") if image.mode == "LA" else image
                        if color.mode not in ("RGB", "L", "CMYK"):
                            color = color.convert("RGB")
                        image = ImageCms.profileToProfile(color, profile, ImageCms.createProfile("sRGB"), outputMode="RGB")
                    except (ValueError, TypeError, OSError, ImageCms.PyCMSError) as error:
                        raise AssessmentError("INVALID_COLOR_PROFILE", "color", "ICC profile cannot be converted to sRGB.", "not_comparable") from error
                    facts["transforms"].append({"icc_to_srgb": True, "icc_sha256": digest(icc)})
                elif image.mode == "CMYK":
                    raise AssessmentError("COLOR_PROFILE_REQUIRED", "color", "CMYK without an ICC profile is ambiguous.", "not_comparable")
                else:
                    image = image.convert("RGB")
                    report["warnings"].append(f"{role}: no ICC profile; assumed sRGB.")
                if alpha.getextrema()[0] < 255:
                    background = config.get("background")
                    if background is None:
                        raise AssessmentError("ALPHA_BACKGROUND_UNKNOWN", "color", "Provide the known shared background, or capture opaque images.", "not_comparable")
                    foreground = image.convert("RGBA")
                    foreground.putalpha(alpha)
                    image = Image.alpha_composite(Image.new("RGBA", image.size, tuple(background) + (255,)), foreground).convert("RGB")
                    facts["transforms"].append({"alpha_background": background})
    except (Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise AssessmentError("PIXEL_LIMIT", "decode", "Image exceeds safe decode limits.") from error
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as error:
        raise AssessmentError("DECODE_FAILED", "decode", "Image is corrupt or cannot be decoded.") from error
    facts["oriented_size"] = list(image.size)
    roi = config.get(f"{role}_roi")
    if roi is not None:
        if not isinstance(roi, list) or len(roi) != 4 or any(type(v) is not int for v in roi):
            raise AssessmentError("INVALID_REGION", "geometry", "Region must be [x,y,width,height] in oriented image pixels.")
        x, y, width, height = roi
        if min(x, y) < 0 or min(width, height) < 1 or x + width > image.width or y + height > image.height:
            raise AssessmentError("INVALID_REGION", "geometry", "Region lies outside the oriented image.")
        if not config.get("geometry_evidence"):
            raise AssessmentError("REGION_UNCONFIRMED", "geometry", "Confirm the corresponding game boundaries before cropping.", "not_comparable")
        image = image.crop((x, y, x + width, y + height))
        facts["transforms"].append({"roi": roi})
    else:
        roi = [0, 0, image.width, image.height]
    facts["region"] = roi
    return image, data, {"PNG": "png", "JPEG": "jpg", "WEBP": "webp"}[fmt]


def gaussian_valid(array):
    """Separable fixed 11-tap Gaussian; no expanded sliding-window allocation."""
    import numpy as np
    weights = np.exp(-(np.arange(-5, 6, dtype=np.float64) ** 2) / (2 * 1.5 ** 2))
    weights /= weights.sum()
    height, width = array.shape
    vertical = np.zeros((height - 10, width), dtype=np.float64)
    for offset, weight in enumerate(weights):
        vertical += weight * array[offset:offset + height - 10, :]
    result = np.zeros((height - 10, width - 10), dtype=np.float64)
    for offset, weight in enumerate(weights):
        result += weight * vertical[:, offset:offset + width - 10]
    return result


def score_images(reference, actual):
    """Return reference-compatible RGB SSIM and fixed diagnostic grid values."""
    import numpy as np
    channels, grids = [], []
    for channel in range(3):
        x, y = reference[:, :, channel].astype(np.float64), actual[:, :, channel].astype(np.float64)
        ux, uy = gaussian_valid(x), gaussian_valid(y)
        vx, vy = gaussian_valid(x * x) - ux * ux, gaussian_valid(y * y) - uy * uy
        covariance = gaussian_valid(x * y) - ux * uy
        field = ((2 * ux * uy + 2.55 ** 2) * (2 * covariance + 7.65 ** 2)) / (
            (ux * ux + uy * uy + 2.55 ** 2) * (vx + vy + 7.65 ** 2))
        channels.append(float(field.mean()))
        grids.append([float(cell.mean()) for row in np.array_split(field, min(3, field.shape[0]), axis=0)
                      for cell in np.array_split(row, min(3, field.shape[1]), axis=1)])
    score = 100 * float(np.clip(np.mean(channels), 0, 1))
    return score, {"channel_ssim": channels, "grid_ssim": np.mean(grids, axis=0).tolist()}


def atomic_report(output, report):
    data = canonical(report) + b"\n"
    temporary = output / "assessment.json.partial"
    with temporary.open("xb") as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(output / "assessment.json")
    return digest(data)


def evaluate(args, report, output):
    import numpy as np
    from PIL import Image, __version__ as pillow_version
    report["runtime"] = {"pillow": pillow_version, "numpy": np.__version__, "python": sys.version.split()[0]}
    if pillow_version != "12.0.0" or np.__version__ != "2.4.1":
        raise AssessmentError("DEPENDENCY_VERSION_MISMATCH", "runtime", "Use the exact Pillow/NumPy versions supplied by PythonRuntime.")
    config = load_config(args.config)
    report.update(measurement_id=config["measurement_id"], configuration=config,
                  configuration_sha256=digest(canonical(config)), capture=config.get("capture"))
    reference, ref_bytes, ref_ext = load_image(Path(args.reference), "reference", config, report)
    actual, actual_bytes, actual_ext = load_image(Path(args.actual), "actual", config, report)
    capture = config.get("capture")
    if capture:
        expected = [v * capture["dpr"] for v in capture["viewport"]]
        if any(abs(v - real) > 1 for v, real in zip(expected, actual.size)):
            raise AssessmentError("CAPTURE_SIZE_MISMATCH", "geometry", "Capture viewport/DPR does not describe the actual game region.", "not_comparable")
    if reference.size != actual.size:
        if not config.get("geometry_evidence"):
            raise AssessmentError("SCALE_UNCONFIRMED", "geometry", "Different image sizes require confirmed full-region/DPR correspondence.", "not_comparable")
        # At most one pixel of independent integer rounding at either original size.
        rw, rh = reference.size
        aw, ah = actual.size
        if abs(rw * ah - aw * rh) > max(rw, rh, aw, ah):
            raise AssessmentError("ASPECT_MISMATCH", "geometry", "Regions have different aspect ratios; recapture without stretching.", "not_comparable")
    scale = min(1.0, COMPARE_SIDE / max(reference.size))
    target = tuple(max(1, round(v * scale)) for v in reference.size)
    if min(target) < 11:
        raise AssessmentError("IMAGE_TOO_SMALL", "geometry", "Comparison requires at least 11 pixels per dimension.", "not_comparable")
    for role, image in (("reference", reference), ("actual", actual)):
        report["inputs"][role]["transforms"].append({"from": list(image.size), "to": list(target), "resample": "LANCZOS"})
    reference = reference.resize(target, Image.Resampling.LANCZOS)
    actual = actual.resize(target, Image.Resampling.LANCZOS)
    report["comparison_size"] = list(target)
    a, b = np.asarray(reference), np.asarray(actual)
    score, diagnostics = score_images(a, b)
    if not math.isfinite(score):
        raise AssessmentError("NONFINITE_SCORE", "score", "The metric did not produce a finite score.")
    absolute = np.abs(a.astype(np.int16) - b.astype(np.int16))
    diagnostics["mean_absolute_rgb_difference"] = float(absolute.mean())
    gray_a, gray_b = a.mean(axis=2), b.mean(axis=2)
    diagnostics["mean_edge_difference"] = float(np.mean([
        np.abs(np.diff(gray_a, axis=axis) - np.diff(gray_b, axis=axis)).mean() for axis in (0, 1)]))
    diagnostics["uniform_reference"] = bool(a.min(axis=(0, 1)).tolist() == a.max(axis=(0, 1)).tolist())
    diagnostics["uniform_actual"] = bool(b.min(axis=(0, 1)).tolist() == b.max(axis=(0, 1)).tolist())
    if diagnostics["uniform_reference"] or diagnostics["uniform_actual"]:
        report["warnings"].append("Uniform image: check the intended UI; this metric cannot distinguish blank failure from intentional minimalism.")
    reference.save(output / "reference-normalized.png")
    actual.save(output / "actual-normalized.png")
    comparison = Image.new("RGB", (target[0] * 2, target[1]))
    comparison.paste(reference, (0, 0))
    comparison.paste(actual, (target[0], 0))
    comparison.save(output / "comparison.png")
    heat = np.zeros_like(a)
    heat[:, :, 0] = np.clip(absolute.mean(axis=2) * 4, 0, 255).astype(np.uint8)
    Image.fromarray(heat).save(output / "difference.png")
    # Preserve exact original bytes, including unusual but decodable encodings.
    originals = {"reference": (ref_bytes, ref_ext), "actual": (actual_bytes, actual_ext)}
    for role, (data, extension) in originals.items():
        name = f"{role}-original.{extension}"
        (output / name).write_bytes(data)
        report["inputs"][role]["original_copy"] = name
    report.update(status="evaluated", score=score, metric_pass=score >= args.threshold,
                  diagnostics=diagnostics, images=["reference-normalized.png", "actual-normalized.png", "comparison.png", "difference.png"])


def main(argv=None):
    report = {"schema": SCHEMA, "algorithm": ALGORITHM, "status": "error", "score": None,
              "metric_pass": False, "inputs": {}, "warnings": []}
    output, timer = None, None
    started = time.monotonic()
    try:
        parser = Parser(description=__doc__)
        for name in ("reference", "actual", "output", "case-id", "run-id"):
            parser.add_argument("--" + name, required=True)
        parser.add_argument("--config", help="Optional frozen measurement JSON; see capture-and-comparison.md.")
        parser.add_argument("--threshold", type=float, default=80)
        parser.add_argument("--threshold-source", choices=("default", "user"), default="default")
        args = parser.parse_args(argv)
        for name in ("case_id", "run_id"):
            if not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", getattr(args, name)):
                raise AssessmentError("INVALID_ID", "arguments", "case/run ids use 1..100 ASCII letters, digits, underscores or hyphens.")
        if not math.isfinite(args.threshold) or not 0 <= args.threshold <= 100:
            raise AssessmentError("INVALID_THRESHOLD", "arguments", "Threshold must be finite and between 0 and 100.")
        if args.threshold_source == "default" and args.threshold != 80:
            raise AssessmentError("THRESHOLD_SOURCE_REQUIRED", "arguments", "A non-default threshold must explicitly identify its user source.")
        report.update(case_id=args.case_id, run_id=args.run_id, threshold=args.threshold, threshold_source=args.threshold_source)
        requested = Path(args.output).absolute()
        if requested.exists() or requested.is_symlink():
            raise AssessmentError("OUTPUT_EXISTS", "output", "Use a new run output directory; existing output is never reused or replaced.")
        requested.parent.mkdir(parents=True, exist_ok=True)
        requested.mkdir()  # exclusive ownership also rejects concurrent attempts
        output = requested

        def timeout():
            # A hard process deadline also bounds native decoder stalls on Windows.
            failure = {"schema": SCHEMA, "status": "error", "score": None, "metric_pass": False,
                       "case_id": args.case_id, "run_id": args.run_id,
                       "error": {"code": "TIMEOUT", "stage": "execution", "message": "60 second budget exceeded; ignore partial output."}}
            sys.stdout.write(json.dumps(failure) + "\n")
            sys.stdout.flush()
            os._exit(124)

        timer = threading.Timer(MAX_SECONDS, timeout)
        timer.daemon = True
        timer.start()
        evaluate(args, report, output)
    except AssessmentError as error:
        report.update(status=error.status, score=None, metric_pass=False,
                      error={"code": error.code, "stage": error.stage, "message": str(error)[:500]})
    except (ImportError, ModuleNotFoundError):
        report["error"] = {"code": "DEPENDENCY_UNAVAILABLE", "stage": "runtime", "message": "Use PythonRuntime.check and the locked ready environment."}
    except Exception as error:
        report.update(status="error", score=None, metric_pass=False,
                      error={"code": "EVALUATION_FAILED", "stage": "execution", "message": f"{type(error).__name__}: evaluation failed; check inputs, configuration and output permissions."})
    report["elapsed_ms"] = round((time.monotonic() - started) * 1000)
    if output:
        try:
            report_hash = atomic_report(output, report)
            report["report"] = "assessment.json"
            report["report_sha256"] = report_hash
        except OSError:
            report.update(status="error", score=None, metric_pass=False,
                          error={"code": "REPORT_WRITE_FAILED", "stage": "output", "message": "Report could not be published; ignore all partial files."})
    print(json.dumps(report, ensure_ascii=False, allow_nan=False))
    if timer:
        timer.cancel()
    return {"evaluated": 0, "not_comparable": 2, "error": 3}[report["status"]]


if __name__ == "__main__":
    sys.exit(main())
