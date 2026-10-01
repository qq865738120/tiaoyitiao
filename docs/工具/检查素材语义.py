#!/usr/bin/env python3
"""Read-only checks of atlas meanings, numbered UVs and exported shadow alpha."""
from pathlib import Path
import json
import struct
import sys
import hashlib
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets/resources/jump'
ERRORS = []
INVENTORY = json.loads((ROOT / 'docs/数据/素材使用清单.json').read_text())
ROWS = {row['asset_path']: row for row in INVENTORY}


def glb(path):
    raw = path.read_bytes()
    magic, version, length = struct.unpack_from('<III', raw)
    assert magic == 0x46546C67 and version == 2 and length == len(raw)
    size, kind = struct.unpack_from('<II', raw, 12)
    assert kind == 0x4E4F534A
    doc = json.loads(raw[20:20 + size])
    offset = 20 + size
    binary_size, binary_kind = struct.unpack_from('<II', raw, offset)
    assert binary_kind == 0x004E4942 and offset + 8 + binary_size == len(raw)
    return doc, raw[offset + 8:]


def image_name(doc, material):
    texture = material.get('pbrMetallicRoughness', {}).get('baseColorTexture')
    return doc['images'][doc['textures'][texture['index']]['source']].get('name', '') if texture else ''


sheet = Image.open(ASSETS / 'original/res/number.png').convert('RGBA')
atlas = []
for region, digit in enumerate([5, 6, 7, None, 1, 2, 3, 4]):
    name = f'digit_{digit}' if digit is not None else 'unused_blank'
    path = ASSETS / f'derived/atlas/number/{name}.png'
    box = (region % 4 * 64, region // 4 * 128, region % 4 * 64 + 64, region // 4 * 128 + 128)
    if not path.is_file():
        ERRORS.append('缺少语义裁片：' + name)
        continue
    image = Image.open(path).convert('RGBA')
    equal = image.size == (64, 128) and image.tobytes() == sheet.crop(box).tobytes()
    visible = image.getchannel('A').getbbox() is not None
    if not equal or visible != (digit is not None):
        ERRORS.append('裁片内容错误：' + name)
    row = ROWS.get(str(path.relative_to(ROOT)), {})
    if row.get('atlas_semantics', {}).get('visible_digit', 'missing') != digit:
        ERRORS.append('裁片含义未写入清单：' + name)
    atlas.append({'name': name, 'digit': digit, 'raster_region': region, 'pixels_equal': equal})
if list((ASSETS / 'derived/atlas/number').glob('region_*.png')):
    ERRORS.append('资源目录还存在含义不清的 region 裁片')

shadows = []
numbered = []
imported_shadows = []
for path in sorted((ASSETS / 'derived/models').glob('*.glb')):
    doc, binary = glb(path)
    for material_index, material in enumerate(doc['materials']):
        name = image_name(doc, material).split('/')[-1]
        if name == 'shadow.png' or name.endswith('_shadow.png'):
            mode = material.get('alphaMode', 'OPAQUE')
            shadows.append({'model': path.name, 'texture': name, 'alpha_mode': mode})
            if mode != 'BLEND':
                ERRORS.append('阴影不是半透明混合：' + path.name)
            meta = json.loads(Path(str(path) + '.meta').read_text())
            imported = next(v for v in meta['subMetas'].values()
                            if v['importer'] == 'gltf-material'
                            and v.get('userData', {}).get('gltfIndex') == material_index)
            library = ROOT / 'library' / imported['uuid'][:2] / (imported['uuid'] + '.json')
            if library.is_file():
                value = json.loads(library.read_text())
                blend = value['_states'][0]['blendState']['targets'][0].get('blend', False)
                if not blend:
                    ERRORS.append('Creator仍使用旧的阴影材质：' + path.name)
                imported_shadows.append({'model': path.name, 'material_uuid': imported['uuid'], 'blend': blend})
            else:
                ERRORS.append('Creator阴影材质产物缺失：' + path.name)
    if not path.name.startswith('numbered_block_'):
        continue
    index = int(path.stem.rsplit('_', 1)[1])
    if ROWS[str(path.relative_to(ROOT))].get('model', {}).get('visible_digit') != index + 1:
        ERRORS.append('编号台显示数字未写入清单：' + path.name)
    region = (index + 4) % 8
    bounds = []
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            material = doc['materials'][primitive['material']]
            if not image_name(doc, material).endswith('/number.png'):
                continue
            accessor = doc['accessors'][primitive['attributes']['TEXCOORD_0']]
            view = doc['bufferViews'][accessor['bufferView']]
            start = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
            stride = view.get('byteStride', 8)
            points = [struct.unpack_from('<ff', binary, start + i * stride) for i in range(accessor['count'])]
            bound = [min(p[0] for p in points), min(p[1] for p in points),
                     max(p[0] for p in points), max(p[1] for p in points)]
            expected = [region % 4 / 4, region // 4 / 2, (region % 4 + 1) / 4, (region // 4 + 1) / 2]
            if bound != expected or material.get('alphaMode') != 'MASK' or material.get('alphaCutoff') != 0.6:
                ERRORS.append('编号台 UV/文字材质不正确：' + path.name)
            bounds.append(bound)
    if len(bounds) != 1:
        ERRORS.append('编号台未找到唯一数字图集：' + path.name)
    numbered.append({'model': path.name, 'source_index': index, 'visible_digit': index + 1,
                     'raster_region': region, 'uv_bounds': bounds})
if len(shadows) != 43 or len(numbered) != 7:
    ERRORS.append('阴影或编号平台数量不正确')

comparison = None
if len(sys.argv) > 1:
    peer = Path(sys.argv[1]).expanduser().resolve()
    mismatches = []
    for row in INVENTORY:
        path = ROOT / row['asset_path']
        other = peer / row['asset_path']
        if not other.is_file() or hashlib.sha256(path.read_bytes()).digest() != hashlib.sha256(other.read_bytes()).digest():
            mismatches.append(row['asset_path'])
            continue
        left = json.loads(Path(str(path) + '.meta').read_text())
        right = json.loads(Path(str(other) + '.meta').read_text())
        if left['uuid'] != right['uuid'] or {v['uuid'] for v in left.get('subMetas', {}).values()} != {v['uuid'] for v in right.get('subMetas', {}).values()}:
            mismatches.append(row['asset_path'] + ' UUID')
    comparison = {'assets': len(INVENTORY), 'equal': not mismatches, 'differences': mismatches}
    if mismatches:
        ERRORS.append('对比工程素材或UUID不同')

print(json.dumps({'atlas': atlas, 'shadows': shadows, 'numbered_models': numbered,
                  'creator_imported_shadows': imported_shadows, 'comparison': comparison,
                  'errors': ERRORS, 'scope': '像素、UV、透明语义；不代表 Creator 视觉验收'}, ensure_ascii=False, indent=2))
sys.exit(bool(ERRORS))
