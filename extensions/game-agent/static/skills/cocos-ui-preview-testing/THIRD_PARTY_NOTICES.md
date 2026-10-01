# Dependencies and calibration

The comparison script and synthetic fixture images are original Game Agent work. No game artwork or user screenshots are included in this package.

The managed runtime downloads separately, according to `requirements.lock`:
- Pillow 12.0.0 — HPND license, https://github.com/python-pillow/Pillow/blob/12.0.0/LICENSE .
- NumPy 2.4.1 — BSD-3-Clause and bundled notices, https://github.com/numpy/numpy/blob/v2.4.1/LICENSE.txt .

No dependency binaries, wheels, virtual environments or copied dependency source are distributed here. Dependency distributions retain their own licenses.

SSIM calibration uses the public `skimage.metrics.structural_similarity` API from scikit-image 0.25.2 (BSD-3-Clause), https://scikit-image.org/docs/0.25.x/api/skimage.metrics.html#skimage.metrics.structural_similarity . The fixed values and exact generator versions are in `fixtures/ssim-goldens.json`. The implementation does not copy scikit-image code or require it at runtime. SSIM originates from Wang et al., Image Quality Assessment: From Error Visibility to Structural Similarity (2004), https://ece.uwaterloo.ca/~z70wang/publications/ssim.html .

The original script and synthetic fixtures follow the repository ISC license in `LICENSE`. Unmodified license notices from the pinned macOS arm64 dependency distributions are included in `licenses/` for offline reference. Actual managed distributions on other platforms retain their own complete notices.
