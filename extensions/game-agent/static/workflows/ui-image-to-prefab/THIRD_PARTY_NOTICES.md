# Third-party notices

## Pillow 12.0.0

- Project: Pillow
- Upstream: https://python-pillow.org/
- License: HPND
- Delivery: hash-pinned binary wheels installed into the isolated Workflow Python environment from `requirements.lock`

Pillow is used for static PNG/JPEG/WebP decoding, RGBA conversion, quadrant cropping and deterministic PNG output. Animated inputs are rejected.

## NumPy 2.4.1

- Project: NumPy
- Upstream: https://numpy.org/
- License: BSD-3-Clause
- Delivery: hash-pinned binary wheels installed into the isolated Workflow Python environment from `requirements.lock`

NumPy is used for separator scoring, alpha/background analysis, run-length connected components and pixel-coordinate transforms.

The Workflow package does not vendor either dependency, any package-local `node_modules`, fonts, OCR models, LPIPS models or ONNX runtimes.
