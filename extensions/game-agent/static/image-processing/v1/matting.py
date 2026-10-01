"""Deterministic constant-background matting; no file, workflow or provider IO."""
from __future__ import annotations

import numpy as np


def linear(rgb: np.ndarray) -> np.ndarray:
    """Decode sRGB for physically linear compositing."""
    rgb = np.asarray(rgb, dtype=np.float32)
    return np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4)


def encoded(rgb: np.ndarray) -> np.ndarray:
    """Encode straight linear foreground RGB."""
    rgb = np.clip(rgb, 0, 1)
    return np.where(rgb <= .0031308, 12.92 * rgb, 1.055 * rgb ** (1 / 2.4) - .055)


def box_mean(values: np.ndarray, radius: int) -> np.ndarray:
    """Exact bounded box mean with replicated image edges."""
    pads = ((radius, radius), (radius, radius)) + ((0, 0),) * (values.ndim - 2)
    padded = np.pad(values, pads, mode="edge")
    integral = np.pad(padded, ((1, 0), (1, 0)) + ((0, 0),) * (values.ndim - 2))
    integral = integral.cumsum(0, dtype=np.float64).cumsum(1, dtype=np.float64)
    size = radius * 2 + 1
    return ((integral[size:, size:] - integral[:-size, size:]
             - integral[size:, :-size] + integral[:-size, :-size]) / (size * size)).astype(np.float32)


def guided_alpha(rgb: np.ndarray, alpha: np.ndarray, radius: int, epsilon: float) -> np.ndarray:
    """RGB local linear guidance, with two box passes and a 2r dependency halo."""
    mean = box_mean(rgb, radius)
    mean_alpha = box_mean(alpha, radius)
    covariance = np.empty((*alpha.shape, 3, 3), np.float32)
    for a in range(3):
        for b in range(a, 3):
            value = box_mean(rgb[..., a] * rgb[..., b], radius) - mean[..., a] * mean[..., b]
            covariance[..., a, b] = value
            covariance[..., b, a] = value
        covariance[..., a, a] += epsilon
    cross = box_mean(rgb * alpha[..., None], radius) - mean * mean_alpha[..., None]
    coefficients = np.linalg.solve(covariance, cross[..., None])[..., 0]
    intercept = mean_alpha - (coefficients * mean).sum(2)
    return np.clip((box_mean(coefficients, radius) * rgb).sum(2) + box_mean(intercept, radius), 0, 1)


def boundary_samples(rgba: np.ndarray) -> list[np.ndarray]:
    """Sample each edge independently, bounded to 2048 pixels per edge."""
    sides = [rgba[0], rgba[-1], rgba[:, 0], rgba[:, -1]]
    return [side[::max(1, len(side) // 2048)] for side in sides]


def patterned_boundary(sides: list[np.ndarray]) -> bool:
    """Reject repeated broad A/B/A colour bands on three or more outer edges."""
    repeated_sides = 0
    for side in sides:
        rgb = side[:, :3].astype(np.float32)
        stride = max(1, len(rgb) // 256)
        count = len(rgb) // stride
        colors = np.median(rgb[:count*stride].reshape(count, stride, 3), axis=1)
        segments = []
        start = 0
        for end in range(1, count + 1):
            if end == count or np.linalg.norm(colors[end] - colors[start]) > 8:
                if end - start >= max(2, count * .08):
                    segments.append((np.median(colors[start:end], axis=0), end - start))
                start = end
        if sum(length for _, length in segments) < count * .6:
            continue
        if any(np.linalg.norm(segments[i][0] - segments[i+2][0]) <= 8
               and np.linalg.norm(segments[i][0] - segments[i+1][0]) >= 12
               for i in range(len(segments)-2)):
            repeated_sides += 1
    return repeated_sides >= 3


def single_boundary_foreground(rgba: np.ndarray, key: np.ndarray, radius: float) -> bool:
    """A single connected subject may legitimately make A/B/A runs on three edges.

    Scan row runs with bounded union-find storage instead of allocating a full
    pixel graph. Exceeding the run budget cannot certify a patterned input.
    """
    height, width = rgba.shape[:2]
    parents, touches = [], []
    previous = []
    run_count = 0

    def root(label):
        while parents[label] != label:
            parents[label] = parents[parents[label]]
            label = parents[label]
        return label

    for y in range(height):
        delta = rgba[y, :, :3].astype(np.float32) - key
        foreground = (delta * delta).sum(1) > radius * radius
        changes = np.diff(np.pad(foreground.astype(np.int8), (1, 1)))
        starts, ends = np.flatnonzero(changes == 1), np.flatnonzero(changes == -1)
        run_count += len(starts)
        if run_count > 65536:
            return False
        current, cursor = [], 0
        for start, end in zip(starts, ends):
            while cursor < len(previous) and previous[cursor][1] <= start:
                cursor += 1
            overlaps, index = [], cursor
            while index < len(previous) and previous[index][0] < end:
                overlaps.append(root(previous[index][2]))
                index += 1
            if overlaps:
                label = root(overlaps[0])
                for other in overlaps[1:]:
                    other = root(other)
                    if other != label:
                        parents[other] = label
                        touches[label] = touches[label] or touches[other]
            else:
                label = len(parents)
                parents.append(label)
                touches.append(False)
            touches[label] = touches[label] or y in (0, height-1) or start == 0 or end == width
            current.append((start, end, label))
        previous = current
    return len({root(label) for label, touched in enumerate(touches) if touched}) == 1


def infer_background(rgba: np.ndarray, expected: np.ndarray, profile: dict) -> tuple[np.ndarray | None, dict]:
    """Find a stable border cluster while permitting limited foreground edge contact."""
    sides = boundary_samples(rgba)
    samples = np.concatenate(sides).astype(np.float32)
    samples = samples[samples[:, 3] == 255, :3]
    if len(samples) < 8:
        return None, {"reason": "INSUFFICIENT_BACKGROUND_SAMPLES"}
    # Expected RGB is a generation/audit target, not a rejection radius. Stable
    # border coverage and bounded within-cluster noise establish the actual key.
    candidate = samples
    centre = np.median(candidate, axis=0)
    for _ in range(3):
        support = np.linalg.norm(candidate - centre, axis=1) <= profile["maxBoundaryNoise"]
        if float(support.sum() / len(samples)) < profile["boundaryCoverage"]:
            return None, {"reason": "BACKGROUND_MULTIMODAL"}
        centre = np.median(candidate[support], axis=0)
    # Recompute every membership fact after the final centre shift. Never widen
    # the noise radius using members admitted around an earlier centre.
    distances = np.linalg.norm(candidate - centre, axis=1)
    support = distances <= profile["maxBoundaryNoise"]
    coverage = float(support.sum() / len(samples))
    if coverage < profile["boundaryCoverage"]:
        return None, {"reason": "BACKGROUND_MULTIMODAL", "coverage": coverage}
    noise = float(np.percentile(distances[support], 99.5))
    radius = min(profile["maxBoundaryNoise"], max(2, noise + 1))
    if patterned_boundary(sides) and not single_boundary_foreground(rgba, centre, radius):
        return None, {"reason": "BACKGROUND_PATTERNED"}
    edge_support = [float((np.linalg.norm(side[:, :3].astype(np.float32) - centre, axis=1) <= radius).mean()) for side in sides]
    if sum(value >= .5 for value in edge_support) < 3:
        return None, {"reason": "BACKGROUND_NOT_STABLE", "edgeSupport": edge_support}
    return centre, {"inferredKey": centre.tolist(), "expectedKey": expected.tolist(),
                    "expectedKeyDistance": float(np.linalg.norm(centre - expected)),
                    "coverage": coverage, "noise": noise, "edgeSupport": edge_support}


def foreground_grid(rgba: np.ndarray, background: np.ndarray, profile: dict, use_encoded: bool = False, refine: bool = False) -> tuple[np.ndarray | None, int, dict]:
    """Retain the strongest pixel per cell, then propagate nearest stable foreground seeds."""
    height, width = rgba.shape[:2]
    stride = max(1, int(np.ceil(max(height, width) / profile["sampleGrid"])))
    rows, cols = (height + stride - 1) // stride, (width + stride - 1) // stride
    colors = np.zeros((rows, cols, 3), np.float32)
    distance = np.zeros((rows, cols), np.float32)
    # Only one horizontal strip is converted to float at a time.
    for row in range(rows):
        raw_strip = rgba[row * stride:min(height, (row + 1) * stride), :, :3].astype(np.float32) / 255.
        strip = raw_strip if use_encoded else linear(raw_strip)
        score = ((strip - background) ** 2).sum(2)
        for col in range(cols):
            patch = score[:, col * stride:min(width, (col + 1) * stride)]
            y, x = np.unravel_index(int(patch.argmax()), patch.shape)
            colors[row, col] = strip[y, col * stride + x]
            distance[row, col] = np.sqrt(patch[y, x])
    padded = np.pad(distance, 2, mode="edge")
    local_max = np.maximum.reduce([padded[y:y + rows, x:x + cols] for y in range(5) for x in range(5)])
    seeds = (distance >= local_max - .0001) & (distance >= .15)
    if not seeds.any():
        return None, stride, {"reason": "FOREGROUND_NOT_PROVABLE"}
    def propagate(seed_mask):
        yy, xx = np.indices((rows, cols), dtype=np.int32)
        nearest_y = np.where(seed_mask, yy, -1)
        nearest_x = np.where(seed_mask, xx, -1)
        best = np.where(seed_mask, 0, np.iinfo(np.int32).max)
        step = 1 << max(rows, cols).bit_length()
        while step >= 1:
            for dy, dx in ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)):
                sy, sx = dy * step, dx * step
                candidate_y = np.roll(nearest_y, (sy, sx), (0, 1))
                candidate_x = np.roll(nearest_x, (sy, sx), (0, 1))
                valid = (candidate_y >= 0) & (yy - sy >= 0) & (yy - sy < rows) & (xx - sx >= 0) & (xx - sx < cols)
                score = (candidate_y - yy) ** 2 + (candidate_x - xx) ** 2
                update = valid & (score < best)
                nearest_y[update], nearest_x[update], best[update] = candidate_y[update], candidate_x[update], score[update]
            step //= 2
        return colors[nearest_y, nearest_x]
    prior = propagate(seeds)
    vector = prior - background
    estimate = np.clip(((colors-background)*vector).sum(2) / np.maximum((vector*vector).sum(2), 1e-8), 0, 1)
    residual = np.linalg.norm(colors-(estimate[...,None]*prior+(1-estimate[...,None])*background),axis=2)
    # Spatially interior colors inconsistent with a background blend are additional
    # foreground evidence. Pure soft transitions fit the original line and stay unknown.
    foreground_band = distance > .15
    padded_band = np.pad(foreground_band, 2, constant_values=False)
    interior = np.logical_and.reduce([padded_band[y:y+rows,x:x+cols] for y in range(5) for x in range(5)])
    extra = interior & (residual > .03) if refine else np.zeros_like(interior)
    if extra.any():
        seeds |= extra
        prior = propagate(seeds)
    return prior, stride, {"foregroundSeeds": int(seeds.sum()), "interiorColorSeeds": int(extra.sum()), "sampleStride": stride}


def select_compositing_space(rgba: np.ndarray, bg: np.ndarray, foreground: np.ndarray, stride: int) -> tuple[bool, dict]:
    """Use the same sampled edges to compare two forward models, retaining linear on ties."""
    step = max(1, int(np.ceil(max(rgba.shape[:2]) / 256)))
    raw = rgba[::step, ::step, :3].astype(np.float32) / 255.
    f = foreground[np.arange(0, rgba.shape[0], step)[:, None] // stride,
                   np.arange(0, rgba.shape[1], step)[None, :] // stride]
    c = linear(raw)
    def fit(color, background, prior):
        v = prior - background
        a = np.clip(((color-background)*v).sum(2) / np.maximum((v*v).sum(2), 1e-8), 0, 1)
        return a, np.linalg.norm(color - (a[..., None]*prior+(1-a[..., None])*background), axis=2)
    la, lr = fit(c, bg, f)
    ea, er = fit(raw, encoded(bg), encoded(f))
    # Compare both models in encoded RGB, over a shared mask, never different masks.
    predicted = encoded(la[..., None]*f+(1-la[..., None])*bg)
    lr = np.linalg.norm(raw-predicted, axis=2)
    mask = (la > .03) & (la < .97) & (ea > .03) & (ea < .97)
    if not mask.any():
        return False, {"linearResidual": 0., "encodedResidual": 0., "modelSamples": 0}
    lscore, escore = float(np.median(lr[mask])), float(np.median(er[mask]))
    use_encoded = escore + .003 < lscore and escore < lscore * .5
    return use_encoded, {"linearResidual": lscore, "encodedResidual": escore, "modelSamples": int(mask.sum())}


def remove_background(rgba: np.ndarray, options: dict, profile: dict) -> tuple[np.ndarray | None, dict]:
    """Return a derived image and independent quality facts; never modify the input."""
    alpha = rgba[..., 3]
    expected = np.asarray(options["background"]["rgb"], np.float32)
    clear_count = int((alpha == 0).sum())
    visible_count = int((alpha > 0).sum())
    report = {"algorithmVersion": profile["version"], "width": rgba.shape[1], "height": rgba.shape[0],
              "status": "review_required", "method": "none", "reasons": [],
              "sourceAlpha": {"clearPixels": clear_count, "visiblePixels": visible_count,
                              "semiTransparentPixels": int(((alpha > 0) & (alpha < 255)).sum())}}
    if not visible_count:
        if options.get("allowEmpty", False):
            report.update(status="ready", method="native-alpha", emptyEvidence="source-all-transparent")
            return rgba.copy(), report
        report["reasons"] = ["EMPTY_NOT_ALLOWED"]
        return None, report
    if (alpha != 255).any():
        sides = boundary_samples(rgba)
        edge_clear = [float((side[:, 3] == 0).mean()) for side in sides]
        # Distributed exact transparency is evidence even when valid artwork or a
        # separator touches two edges. An isolated corner or uniform alpha249 is not.
        h, w = alpha.shape
        regions = [alpha[:h//2,:w//2], alpha[:h//2,w//2:], alpha[h//2:,:w//2], alpha[h//2:,w//2:]]
        clear_support = [float((region == 0).mean()) if region.size else 0. for region in regions]
        broad_clear = clear_count / alpha.size >= .05 and sum(value >= .02 for value in clear_support) >= 3
        if clear_count and (sum(value >= .5 for value in edge_clear) >= 3 or broad_clear):
            visible_border_key = sum(int(((side[:, 3] > 8) & (np.linalg.norm(side[:, :3].astype(np.float32) - expected, axis=1) < 16)).sum()) for side in sides)
            if visible_border_key == 0 or not options["background"].get("keyColorIsBackground", False):
                report.update(status="ready", method="native-alpha", edgeClearSupport=edge_clear, spatialClearSupport=clear_support)
                return rgba.copy(), report
        report["reasons"] = ["SUSPICIOUS_SOURCE_ALPHA"]
        return None, report
    if not options["background"].get("keyColorIsBackground", False):
        report["reasons"] = ["KEY_COLOR_USAGE_UNCONFIRMED"]
        return None, report
    key, evidence = infer_background(rgba, expected, profile)
    report["background"] = evidence
    if key is None:
        report["reasons"] = [evidence["reason"]]
        return None, report
    # Empty is proven on the source, not inferred from a destructive output.
    sample_max = 0.
    for row in range(0, len(rgba), 128):
        sample_max = max(sample_max, float(np.linalg.norm(rgba[row:row + 128, :, :3].astype(np.float32) - key, axis=2).max()))
    if sample_max <= max(1, evidence["noise"]):
        if options.get("allowEmpty", False):
            report.update(status="ready", method="solid-color-matting-v1", emptyEvidence="source-uniform-key")
            return np.zeros_like(rgba), report
        report["reasons"] = ["EMPTY_NOT_ALLOWED"]
        return None, report
    bg = linear(key / 255.)
    foreground, stride, seeds = foreground_grid(rgba, bg, profile)
    report.update(seeds)
    if foreground is None:
        report["reasons"] = [seeds["reason"]]
        return None, report
    use_encoded, model_evidence = select_compositing_space(rgba, bg, foreground, stride)
    report["compositingModelEvidence"] = model_evidence
    if use_encoded:
        bg = key / 255.
    foreground, stride, refined_evidence = foreground_grid(rgba, bg, profile, use_encoded, True)
    report.update(refined_evidence)
    result = np.empty_like(rgba)
    height, width = alpha.shape
    tile = profile["tileSize"]
    radius = profile["guideRadius"]
    halo = radius * 2
    uncertain = foreground_pixels = semi = removed = 0
    max_residual = 0.
    noise = min(profile["maxBoundaryNoise"], max(.6, evidence["noise"] + 1.))
    for top in range(0, height, tile):
        for left in range(0, width, tile):
            bottom, right = min(top + tile, height), min(left + tile, width)
            y0, y1 = max(0, top - halo), min(height, bottom + halo)
            x0, x1 = max(0, left - halo), min(width, right + halo)
            raw = rgba[y0:y1, x0:x1, :3].astype(np.float32) / 255.
            color = raw if use_encoded else linear(raw)
            gy = np.arange(y0, y1)[:, None] // stride
            gx = np.arange(x0, x1)[None, :] // stride
            f0 = foreground[gy, gx].copy()
            best_fit = np.full(color.shape[:2], np.inf, np.float32)
            estimate = np.zeros(color.shape[:2], np.float32)
            # A foreground in [0,1] imposes a channel-wise alpha lower bound.
            # Prevent an imperfect seed from forcing impossible negative foreground RGB.
            lower = np.maximum((bg-color)/np.maximum(bg,1e-8), (color-bg)/np.maximum(1-bg,1e-8))
            alpha_floor = np.clip(lower.max(2),0,1)
            # A nearby color-consistent seed may be better than the closest spatial
            # seed at a narrow multicolored rim. Bounded 3x3 candidates retain detail.
            for dy, dx in ((0,0),(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)):
                candidate = foreground[np.clip(gy+dy,0,foreground.shape[0]-1), np.clip(gx+dx,0,foreground.shape[1]-1)]
                vector = candidate - bg
                norm = (vector*vector).sum(2)
                a = np.maximum(alpha_floor, np.clip(((color-bg)*vector).sum(2)/np.maximum(norm,1e-8),0,1))
                fit_score = ((color-(a[...,None]*candidate+(1-a[...,None])*bg))**2).sum(2) + (abs(dx)+abs(dy))*1e-7
                better = fit_score < best_fit
                f0[better], estimate[better], best_fit[better] = candidate[better], a[better], fit_score[better]
            strict_bg = np.linalg.norm(raw * 255 - key, axis=2) <= noise
            estimate[strict_bg] = 0
            alpha_floor[strict_bg] = 0
            core = estimate >= .999
            matte = np.maximum(alpha_floor, guided_alpha(color, estimate, radius, profile["guideEpsilon"]))
            matte[strict_bg] = 0
            matte[core & ~strict_bg] = 1
            # Penalize unsupported foreground colour rather than hiding it by lowering alpha.
            fit = np.linalg.norm(color - (estimate[..., None] * f0 + (1 - estimate[..., None]) * bg), axis=2)
            regularizer = profile["regularization"] * (1 - matte) ** 2
            corrected = (matte[..., None] * (color - (1 - matte[..., None]) * bg)
                         + regularizer[..., None] * f0) / np.maximum((matte ** 2 + regularizer)[..., None], 1e-8)
            output_rgb = np.clip(corrected, 0, 1) if use_encoded else encoded(corrected)
            output_rgb[core] = raw[core]
            output_rgb[matte == 0] = 0
            ys, xs = slice(top - y0, bottom - y0), slice(left - x0, right - x0)
            local_alpha = np.rint(matte[ys, xs] * 255).astype(np.uint8)
            result[top:bottom, left:right, :3] = np.rint(output_rgb[ys, xs] * 255).astype(np.uint8)
            result[top:bottom, left:right, 3] = local_alpha
            uncertain += int(((fit[ys, xs] > .07) & (estimate[ys, xs] < .999) & ~strict_bg[ys, xs]).sum())
            foreground_pixels += int((~strict_bg[ys, xs]).sum())
            semi += int(((local_alpha > 0) & (local_alpha < 255)).sum())
            removed += int((local_alpha == 0).sum())
            max_residual = max(max_residual, float(fit[ys, xs].max()))
    report.update(method="solid-color-matting-v1", compositingSpace="encoded-srgb" if use_encoded else "linear-srgb", removedPixels=removed,
                  semiTransparentPixels=semi, uncertainPixels=uncertain, foregroundPixels=foreground_pixels,
                  maximumFitResidual=max_residual, keyColorUsage="caller-asserted-background-only")
    if not (result[..., 3] > 0).any():
        report["reasons"] = ["FOREGROUND_LOST"]
    elif uncertain / max(1, foreground_pixels) > profile["maxUncertainFraction"]:
        report["reasons"] = ["FOREGROUND_ESTIMATE_UNCERTAIN"]
    else:
        report["status"] = "ready"
    return result, report
