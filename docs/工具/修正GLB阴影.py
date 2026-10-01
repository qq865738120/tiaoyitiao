#!/usr/bin/env python3
"""Preserve GLB geometry and images while restoring shadow alpha blending."""
from pathlib import Path
import argparse
import hashlib
import json
import struct


def read_glb(raw):
    magic, version, length = struct.unpack_from('<III', raw)
    if magic != 0x46546C67 or version != 2 or length != len(raw):
        raise ValueError('Invalid GLB header')
    size, kind = struct.unpack_from('<II', raw, 12)
    if kind != 0x4E4F534A:
        raise ValueError('First GLB chunk is not JSON')
    return json.loads(raw[20:20 + size]), raw[20 + size:]


def shadow_materials(doc):
    for index, material in enumerate(doc.get('materials', [])):
        texture = material.get('pbrMetallicRoughness', {}).get('baseColorTexture')
        if not texture:
            continue
        image = doc['images'][doc['textures'][texture['index']]['source']]
        name = image.get('name', '').replace('\\', '/').split('/')[-1]
        if name == 'shadow.png' or name.endswith('_shadow.png'):
            yield index, material, name


def repair(raw):
    doc, binary_chunks = read_glb(raw)
    changed = []
    for index, material, name in shadow_materials(doc):
        if material.get('alphaMode') != 'MASK':
            continue
        cutoff = material.pop('alphaCutoff', 0.5)
        material['alphaMode'] = 'BLEND'
        material.setdefault('extras', {}).update(originalTransparent=True,
                                                originalAlphaTest=cutoff)
        changed.append({'material': index, 'texture': name, 'original_alpha_test': cutoff})
    if not changed:
        return raw, changed
    data = json.dumps(doc, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    data += b' ' * (-len(data) % 4)
    result = (struct.pack('<III', 0x46546C67, 2, 20 + len(data) + len(binary_chunks))
              + struct.pack('<II', len(data), 0x4E4F534A) + data + binary_chunks)
    return result, changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+', type=Path)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    result = []
    for path in args.files:
        raw = path.read_bytes()
        fixed, changes = repair(raw)
        if args.write and changes:
            path.write_bytes(fixed)
        result.append({'file': str(path), 'changes': changes, 'written': bool(args.write and changes),
                       'before_sha256': hashlib.sha256(raw).hexdigest(),
                       'after_sha256': hashlib.sha256(fixed).hexdigest()})
    print(json.dumps(result, ensure_ascii=False, indent=2))
