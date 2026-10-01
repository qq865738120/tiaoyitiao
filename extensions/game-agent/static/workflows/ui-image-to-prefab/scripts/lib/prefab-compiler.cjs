'use strict';

const crypto = require('crypto');

const CREATOR_UI_2D_LAYER = (1 << 25);
const CREATOR_PREFAB_PROFILE = 'creator-3.8-prefab-json-v2';
const TOP_LEVEL_FIELDS = Object.freeze({
    'cc.Prefab': ['__type__', '_name', '_objFlags', '__editorExtras__', '_native', 'data', 'optimizationPolicy', 'persistent'],
    'cc.Node': ['__type__', '_name', '_objFlags', '__editorExtras__', '_parent', '_children', '_active', '_components', '_prefab', '_lpos', '_lrot', '_lscale', '_mobility', '_layer', '_euler', '_id'],
    'cc.UITransform': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '_contentSize', '_anchorPoint', '_id'],
    'cc.CompPrefabInfo': ['__type__', 'fileId'],
    'cc.PrefabInfo': ['__type__', 'root', 'asset', 'fileId', 'instance', 'targetOverrides', 'nestedPrefabInstanceRoots'],
    'cc.Sprite': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '_customMaterial', '_srcBlendFactor', '_dstBlendFactor', '_color', '_spriteFrame', '_type', '_fillType', '_sizeMode', '_fillCenter', '_fillStart', '_fillRange', '_isTrimmedMode', '_useGrayscale', '_atlas', '_id'],
    'cc.Label': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '_customMaterial', '_srcBlendFactor', '_dstBlendFactor', '_color', '_string', '_horizontalAlign', '_verticalAlign', '_actualFontSize', '_fontSize', '_fontFamily', '_lineHeight', '_overflow', '_enableWrapText', '_font', '_isSystemFontUsed', '_spacingX', '_isItalic', '_isBold', '_isUnderline', '_underlineHeight', '_cacheMode', '_id'],
    'cc.Button': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', 'clickEvents', '_interactable', '_transition', '_normalColor', '_hoverColor', '_pressedColor', '_disabledColor', '_normalSprite', '_hoverSprite', '_pressedSprite', '_disabledSprite', '_duration', '_zoomScale', '_target', '_id'],
    'cc.Widget': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '_alignFlags', '_target', '_left', '_right', '_top', '_bottom', '_horizontalCenter', '_verticalCenter', '_isAbsLeft', '_isAbsRight', '_isAbsTop', '_isAbsBottom', '_isAbsHorizontalCenter', '_isAbsVerticalCenter', '_originalWidth', '_originalHeight', '_alignMode', '_lockFlags', '_id'],
    'cc.Layout': ['__type__', '_name', '_objFlags', '__editorExtras__', 'node', '_enabled', '__prefab', '_resizeMode', '_layoutType', '_cellSize', '_startAxis', '_paddingLeft', '_paddingRight', '_paddingTop', '_paddingBottom', '_spacingX', '_spacingY', '_verticalDirection', '_horizontalDirection', '_constraint', '_constraintNum', '_affectedByScale', '_isAlign', '_id'],
});
const TOP_LEVEL_FIELD_SETS = Object.freeze(Object.fromEntries(
    Object.entries(TOP_LEVEL_FIELDS).map(([type, fields]) => [type, new Set(fields)]),
));
const COMPONENT_TYPES = {
    sprite: 'cc.Sprite', label: 'cc.Label', button: 'cc.Button', widget: 'cc.Widget', layout: 'cc.Layout',
};
const SPRITE_TYPES = { SIMPLE: 0, SLICED: 1, TILED: 2, FILLED: 3 };
const SPRITE_FILL_TYPES = { HORIZONTAL: 0, VERTICAL: 1, RADIAL: 2 };
const LAYOUT_TYPES = { NONE: 0, HORIZONTAL: 1, VERTICAL: 2, GRID: 3 };
const LAYOUT_RESIZE_MODES = { NONE: 0, CONTAINER: 1, CHILDREN: 2 };
const WIDGET_ALIGN_MODES = { ONCE: 0, ALWAYS: 1, ON_WINDOW_RESIZE: 2 };
const BUTTON_TRANSITIONS = { NONE: 0, COLOR: 1, SPRITE: 2, SCALE: 3 };

function assertBlueprint(blueprint) {
    if (!blueprint || blueprint.schema !== 'game-agent.ui-prefab-blueprint/v2'
        || !Array.isArray(blueprint.nodes) || blueprint.nodes.length < 1) {
        throw new Error('UI_PREFAB_BLUEPRINT_INVALID');
    }
    const byId = new Map();
    for (const node of blueprint.nodes) {
        if (!node || typeof node.id !== 'string' || byId.has(node.id)) {
            throw new Error('UI_PREFAB_BLUEPRINT_DUPLICATE_NODE');
        }
        byId.set(node.id, node);
    }
    for (const node of byId.values()) {
        if (node.parentId !== null && !byId.has(node.parentId)) {
            throw new Error('UI_PREFAB_BLUEPRINT_PARENT_MISSING');
        }
    }
    const state = new Map();
    for (const id of byId.keys()) {
        if (state.get(id) === 2) continue;
        const path = [];
        let current = id;
        while (current !== null && state.get(current) !== 2) {
            if (state.get(current) === 1) throw new Error('UI_PREFAB_BLUEPRINT_CYCLE');
            state.set(current, 1);
            path.push(current);
            current = byId.get(current).parentId;
        }
        for (const visited of path) state.set(visited, 2);
    }
    return byId;
}

function selectDocumentRoot(blueprint, prefabName) {
    const byId = assertBlueprint(blueprint);
    const roots = [...byId.values()].filter((node) => node.parentId === null);
    if (roots.length !== 1) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_COUNT_INVALID');
    const root = roots[0];
    if (blueprint.rootId !== root.id) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_ID_INVALID');
    if (root.name !== prefabName) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_NAME_MISMATCH');
    if (root.components.length > 0) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_COMPONENTS_UNSUPPORTED');
    const transform = root.transform || {};
    if (Number(transform.x) !== 0 || Number(transform.y) !== 0 || Number(transform.rotation) !== 0
        || Number(transform.scaleX) !== 1 || Number(transform.scaleY) !== 1) {
        throw new Error('UI_PREFAB_BLUEPRINT_ROOT_TRANSFORM_UNSUPPORTED');
    }
    return root;
}

function exactNumber(value, code) {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(code);
    return number;
}

function exactEnum(table, value, fallback, code) {
    const name = String(value === undefined ? fallback : value).toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(table, name)) throw new Error(code);
    return table[name];
}

function stableFileId(semanticKey) {
    return crypto.createHash('sha256').update(String(semanticKey), 'utf8')
        .digest().slice(0, 16).toString('base64').replace(/=+$/u, '');
}

function sortedBlueprint(blueprint, prefabName) {
    const byId = assertBlueprint(blueprint);
    const roots = [...byId.values()].filter((node) => node.parentId === null);
    if (roots.length !== 1) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_COUNT_INVALID');
    if (blueprint.rootId !== roots[0].id) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_ID_INVALID');
    if (roots[0].name !== prefabName) throw new Error('UI_PREFAB_BLUEPRINT_ROOT_NAME_MISMATCH');
    const children = new Map([...byId.keys()].map((id) => [id, []]));
    for (const node of byId.values()) {
        if (!Array.isArray(node.components)) throw new Error(`UI_PREFAB_COMPONENTS_INVALID:${node.id}`);
        if (node.parentId !== null) children.get(node.parentId).push(node);
    }
    for (const [parentId, values] of children) {
        values.sort((left, right) => left.siblingIndex - right.siblingIndex || left.id.localeCompare(right.id));
        for (let index = 1; index < values.length; index += 1) {
            if (values[index - 1].siblingIndex === values[index].siblingIndex) {
                throw new Error(`UI_PREFAB_SIBLING_INDEX_DUPLICATE:${parentId}`);
            }
        }
    }
    const ordered = [];
    const stack = [roots[0]];
    while (stack.length) {
        const node = stack.pop();
        ordered.push(node);
        const values = children.get(node.id);
        for (let index = values.length - 1; index >= 0; index -= 1) stack.push(values[index]);
    }
    if (ordered.length !== byId.size) throw new Error('UI_PREFAB_BLUEPRINT_DISCONNECTED');
    return { children, ordered };
}

function allocateObjectTable(ordered) {
    let next = 1;
    const allocations = new Map();
    for (const node of ordered) {
        const allocation = { node: next++, uiTransform: next++, uiTransformInfo: next++, components: [], prefabInfo: -1 };
        for (const component of node.components) {
            if (!COMPONENT_TYPES[component.kind]) throw new Error(`UI_PREFAB_COMPONENT_UNSUPPORTED:${component.kind}`);
            allocation.components.push({ component: next++, prefabInfo: next++ });
        }
        allocation.prefabInfo = next++;
        allocations.set(node.id, allocation);
    }
    return { allocations, length: next };
}

function componentBase(type, nodeIndex, prefabInfoIndex) {
    return {
        __type__: type, _name: '', _objFlags: 0, __editorExtras__: {},
        node: { __id__: nodeIndex }, _enabled: true, __prefab: { __id__: prefabInfoIndex },
    };
}

function color(value) {
    const source = value && typeof value === 'object' ? value : {};
    const channel = (name, fallback) => Math.max(0, Math.min(255,
        Math.round(exactNumber(source[name] === undefined ? fallback : source[name], 'UI_PREFAB_COLOR_INVALID'))));
    return { __type__: 'cc.Color', r: channel('r', 255), g: channel('g', 255), b: channel('b', 255), a: channel('a', 255) };
}

function compileSprite(nodeIndex, prefabInfoIndex, properties, materialBindings) {
    const logicalId = String(properties.materialLogicalId || '');
    const binding = materialBindings[logicalId];
    const uuid = typeof binding === 'string' ? binding : binding && binding.uuid;
    if (typeof uuid !== 'string' || uuid.length < 1) throw new Error(`UI_PREFAB_MATERIAL_UUID_MISSING:${logicalId}`);
    const spriteType = exactEnum(SPRITE_TYPES, properties.spriteType, 'SIMPLE', 'UI_PREFAB_SPRITE_TYPE_INVALID');
    return {
        ...componentBase('cc.Sprite', nodeIndex, prefabInfoIndex),
        _customMaterial: null, _srcBlendFactor: 2, _dstBlendFactor: 4, _color: color(properties.color),
        _spriteFrame: { __uuid__: uuid, __expectedType__: 'cc.SpriteFrame' },
        _type: spriteType,
        _fillType: exactEnum(SPRITE_FILL_TYPES, properties.fillType, 'HORIZONTAL', 'UI_PREFAB_SPRITE_FILL_TYPE_INVALID'),
        _sizeMode: 0, _fillCenter: { __type__: 'cc.Vec2', x: 0, y: 0 },
        _fillStart: exactNumber(properties.fillStart === undefined ? 0 : properties.fillStart, 'UI_PREFAB_SPRITE_FILL_INVALID'),
        _fillRange: exactNumber(properties.fillRange === undefined ? (spriteType === 3 ? 1 : 0) : properties.fillRange, 'UI_PREFAB_SPRITE_FILL_INVALID'),
        _isTrimmedMode: properties.trimMode === undefined ? spriteType !== SPRITE_TYPES.SIMPLE : Boolean(properties.trimMode),
        _useGrayscale: Boolean(properties.useGrayscale), _atlas: null, _id: '',
    };
}

function compileLabel(nodeIndex, prefabInfoIndex, properties) {
    const fontSize = exactNumber(properties.fontSize === undefined ? 16 : properties.fontSize, 'UI_PREFAB_LABEL_FONT_SIZE_INVALID');
    const lineHeight = exactNumber(properties.lineHeight === undefined ? fontSize : properties.lineHeight, 'UI_PREFAB_LABEL_LINE_HEIGHT_INVALID');
    return {
        ...componentBase('cc.Label', nodeIndex, prefabInfoIndex),
        _customMaterial: null, _srcBlendFactor: 2, _dstBlendFactor: 4, _color: color(properties.color),
        _string: String(properties.text || ''), _horizontalAlign: 1, _verticalAlign: 1,
        _actualFontSize: fontSize, _fontSize: fontSize, _fontFamily: String(properties.fontFamily || 'Arial'),
        // Creator Overflow.SHRINK=2：字体替换后完整显示冻结文本，保持目标框与布局。
        _lineHeight: lineHeight, _overflow: 2, _enableWrapText: properties.enableWrapText !== false,
        _font: null, _isSystemFontUsed: true,
        _spacingX: exactNumber(properties.spacingX === undefined ? 0 : properties.spacingX, 'UI_PREFAB_LABEL_SPACING_INVALID'),
        _isItalic: Boolean(properties.italic), _isBold: Boolean(properties.bold),
        _isUnderline: Boolean(properties.underline), _underlineHeight: 2, _cacheMode: 0, _id: '',
    };
}

function compileButton(nodeIndex, prefabInfoIndex, properties) {
    return {
        ...componentBase('cc.Button', nodeIndex, prefabInfoIndex),
        clickEvents: [], _interactable: properties.interactable !== false,
        _transition: exactEnum(BUTTON_TRANSITIONS, properties.transition, 'COLOR', 'UI_PREFAB_BUTTON_TRANSITION_INVALID'),
        _normalColor: color(properties.normalColor),
        _hoverColor: color(properties.hoverColor || { r: 211, g: 211, b: 211, a: 255 }),
        _pressedColor: color(properties.pressedColor),
        _disabledColor: color(properties.disabledColor || { r: 124, g: 124, b: 124, a: 255 }),
        _normalSprite: null, _hoverSprite: null, _pressedSprite: null, _disabledSprite: null,
        _duration: exactNumber(properties.duration === undefined ? 0.1 : properties.duration, 'UI_PREFAB_BUTTON_DURATION_INVALID'),
        _zoomScale: exactNumber(properties.zoomScale === undefined ? 1.2 : properties.zoomScale, 'UI_PREFAB_BUTTON_ZOOM_INVALID'),
        _target: null, _id: '',
    };
}

function compileWidget(nodeIndex, prefabInfoIndex, properties, transform) {
    let flags = 0;
    if (properties.isAlignTop) flags |= 1;
    if (properties.isAlignVerticalCenter) flags |= 2;
    if (properties.isAlignBottom) flags |= 4;
    if (properties.isAlignLeft) flags |= 8;
    if (properties.isAlignHorizontalCenter) flags |= 16;
    if (properties.isAlignRight) flags |= 32;
    return {
        ...componentBase('cc.Widget', nodeIndex, prefabInfoIndex), _alignFlags: flags, _target: null,
        _left: exactNumber(properties.left === undefined ? 0 : properties.left, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _right: exactNumber(properties.right === undefined ? 0 : properties.right, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _top: exactNumber(properties.top === undefined ? 0 : properties.top, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _bottom: exactNumber(properties.bottom === undefined ? 0 : properties.bottom, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _horizontalCenter: exactNumber(properties.horizontalCenter === undefined ? 0 : properties.horizontalCenter, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _verticalCenter: exactNumber(properties.verticalCenter === undefined ? 0 : properties.verticalCenter, 'UI_PREFAB_WIDGET_OFFSET_INVALID'),
        _isAbsLeft: properties.isAbsoluteLeft !== false, _isAbsRight: properties.isAbsoluteRight !== false,
        _isAbsTop: properties.isAbsoluteTop !== false, _isAbsBottom: properties.isAbsoluteBottom !== false,
        _isAbsHorizontalCenter: properties.isAbsoluteHorizontalCenter !== false,
        _isAbsVerticalCenter: properties.isAbsoluteVerticalCenter !== false,
        _originalWidth: exactNumber(transform.width, 'UI_PREFAB_WIDGET_SIZE_INVALID'),
        _originalHeight: exactNumber(transform.height, 'UI_PREFAB_WIDGET_SIZE_INVALID'),
        _alignMode: exactEnum(WIDGET_ALIGN_MODES, properties.alignMode, 'ON_WINDOW_RESIZE', 'UI_PREFAB_WIDGET_ALIGN_MODE_INVALID'),
        _lockFlags: 0, _id: '',
    };
}

function compileLayout(nodeIndex, prefabInfoIndex, properties) {
    return {
        ...componentBase('cc.Layout', nodeIndex, prefabInfoIndex),
        _resizeMode: exactEnum(LAYOUT_RESIZE_MODES, properties.resizeMode, 'NONE', 'UI_PREFAB_LAYOUT_RESIZE_MODE_INVALID'),
        _layoutType: exactEnum(LAYOUT_TYPES, properties.type, 'NONE', 'UI_PREFAB_LAYOUT_TYPE_INVALID'),
        _cellSize: {
            __type__: 'cc.Size',
            width: exactNumber(properties.cellWidth === undefined ? 40 : properties.cellWidth, 'UI_PREFAB_LAYOUT_SIZE_INVALID'),
            height: exactNumber(properties.cellHeight === undefined ? 40 : properties.cellHeight, 'UI_PREFAB_LAYOUT_SIZE_INVALID'),
        },
        _startAxis: 0,
        _paddingLeft: exactNumber(properties.paddingLeft === undefined ? 0 : properties.paddingLeft, 'UI_PREFAB_LAYOUT_PADDING_INVALID'),
        _paddingRight: exactNumber(properties.paddingRight === undefined ? 0 : properties.paddingRight, 'UI_PREFAB_LAYOUT_PADDING_INVALID'),
        _paddingTop: exactNumber(properties.paddingTop === undefined ? 0 : properties.paddingTop, 'UI_PREFAB_LAYOUT_PADDING_INVALID'),
        _paddingBottom: exactNumber(properties.paddingBottom === undefined ? 0 : properties.paddingBottom, 'UI_PREFAB_LAYOUT_PADDING_INVALID'),
        _spacingX: exactNumber(properties.spacingX === undefined ? 0 : properties.spacingX, 'UI_PREFAB_LAYOUT_SPACING_INVALID'),
        _spacingY: exactNumber(properties.spacingY === undefined ? 0 : properties.spacingY, 'UI_PREFAB_LAYOUT_SPACING_INVALID'),
        _verticalDirection: 1, _horizontalDirection: 0, _constraint: 0, _constraintNum: 2,
        _affectedByScale: false, _isAlign: false, _id: '',
    };
}

function compileComponent(kind, nodeIndex, prefabInfoIndex, properties, materialBindings, transform) {
    if (kind === 'sprite') return compileSprite(nodeIndex, prefabInfoIndex, properties, materialBindings);
    if (kind === 'label') return compileLabel(nodeIndex, prefabInfoIndex, properties);
    if (kind === 'button') return compileButton(nodeIndex, prefabInfoIndex, properties);
    if (kind === 'widget') return compileWidget(nodeIndex, prefabInfoIndex, properties, transform);
    if (kind === 'layout') return compileLayout(nodeIndex, prefabInfoIndex, properties);
    throw new Error(`UI_PREFAB_COMPONENT_UNSUPPORTED:${kind}`);
}

function compileCreatorPrefab(blueprint, options) {
    const prefabName = String(options && options.prefabName || '');
    const materialBindings = options && options.materialBindings || {};
    selectDocumentRoot(blueprint, prefabName);
    const { children, ordered } = sortedBlueprint(blueprint, prefabName);
    const { allocations, length } = allocateObjectTable(ordered);
    const objects = new Array(length);
    objects[0] = {
        __type__: 'cc.Prefab', _name: prefabName, _objFlags: 0, __editorExtras__: {}, _native: '',
        data: { __id__: allocations.get(blueprint.rootId).node }, optimizationPolicy: 0, persistent: false,
    };
    const fileIds = new Set();
    const allocateFileId = (key) => {
        const fileId = stableFileId(`${CREATOR_PREFAB_PROFILE}:${key}`);
        if (fileIds.has(fileId)) throw new Error('UI_PREFAB_FILE_ID_COLLISION');
        fileIds.add(fileId);
        return fileId;
    };
    const rootIndex = allocations.get(blueprint.rootId).node;
    for (const node of ordered) {
        const allocation = allocations.get(node.id);
        const transform = node.transform || {};
        const angle = exactNumber(transform.rotation, `UI_PREFAB_TRANSFORM_INVALID:${node.id}`);
        const radians = angle * Math.PI / 180;
        objects[allocation.node] = {
            __type__: 'cc.Node', _name: node.name, _objFlags: 0, __editorExtras__: {},
            _parent: node.parentId === null ? null : { __id__: allocations.get(node.parentId).node },
            _children: children.get(node.id).map((child) => ({ __id__: allocations.get(child.id).node })),
            _active: true,
            _components: [{ __id__: allocation.uiTransform }].concat(allocation.components.map((entry) => ({ __id__: entry.component }))),
            _prefab: { __id__: allocation.prefabInfo },
            _lpos: { __type__: 'cc.Vec3', x: exactNumber(transform.x, `UI_PREFAB_TRANSFORM_INVALID:${node.id}`), y: exactNumber(transform.y, `UI_PREFAB_TRANSFORM_INVALID:${node.id}`), z: 0 },
            _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: Math.sin(radians / 2), w: Math.cos(radians / 2) },
            _lscale: { __type__: 'cc.Vec3', x: exactNumber(transform.scaleX, `UI_PREFAB_TRANSFORM_INVALID:${node.id}`), y: exactNumber(transform.scaleY, `UI_PREFAB_TRANSFORM_INVALID:${node.id}`), z: 1 },
            _mobility: 0, _layer: CREATOR_UI_2D_LAYER,
            _euler: { __type__: 'cc.Vec3', x: 0, y: 0, z: angle }, _id: '',
        };
        objects[allocation.uiTransform] = {
            ...componentBase('cc.UITransform', allocation.node, allocation.uiTransformInfo),
            _contentSize: {
                __type__: 'cc.Size', width: exactNumber(transform.width, `UI_PREFAB_SIZE_INVALID:${node.id}`),
                height: exactNumber(transform.height, `UI_PREFAB_SIZE_INVALID:${node.id}`),
            },
            _anchorPoint: {
                __type__: 'cc.Vec2', x: exactNumber(node.anchor && node.anchor.x, `UI_PREFAB_ANCHOR_INVALID:${node.id}`),
                y: exactNumber(node.anchor && node.anchor.y, `UI_PREFAB_ANCHOR_INVALID:${node.id}`),
            },
            _id: '',
        };
        objects[allocation.uiTransformInfo] = { __type__: 'cc.CompPrefabInfo', fileId: allocateFileId(`node:${node.id}:ui-transform`) };
        for (let index = 0; index < node.components.length; index += 1) {
            const descriptor = allocation.components[index];
            const component = node.components[index];
            objects[descriptor.component] = compileComponent(
                component.kind, allocation.node, descriptor.prefabInfo,
                component.properties || {}, materialBindings, transform,
            );
            objects[descriptor.prefabInfo] = {
                __type__: 'cc.CompPrefabInfo', fileId: allocateFileId(`node:${node.id}:component:${index}:${component.kind}`),
            };
        }
        objects[allocation.prefabInfo] = {
            __type__: 'cc.PrefabInfo', root: { __id__: rootIndex }, asset: { __id__: 0 },
            fileId: allocateFileId(`node:${node.id}`), instance: null, targetOverrides: null, nestedPrefabInstanceRoots: null,
        };
    }
    validateCompiledPrefab(objects, blueprint, materialBindings);
    return {
        profile: CREATOR_PREFAB_PROFILE, objects, json: `${JSON.stringify(objects, null, 2)}\n`,
        objectCount: objects.length, nodeCount: ordered.length,
    };
}

function validateCompiledPrefab(objects, blueprint, materialBindings) {
    if (!Array.isArray(objects) || !objects.length || objects[0].__type__ !== 'cc.Prefab') {
        throw new Error('UI_PREFAB_OBJECT_TABLE_INVALID');
    }
    const nodes = [];
    const fileIds = new Set();
    for (let index = 0; index < objects.length; index += 1) {
        const object = objects[index];
        if (!object || typeof object !== 'object' || Array.isArray(object)) throw new Error(`UI_PREFAB_OBJECT_INVALID:${index}`);
        const knownFields = TOP_LEVEL_FIELD_SETS[object.__type__];
        if (!knownFields) throw new Error(`UI_PREFAB_OBJECT_TYPE_UNKNOWN:${index}:${String(object.__type__)}`);
        for (const field of TOP_LEVEL_FIELDS[object.__type__]) {
            if (!Object.prototype.hasOwnProperty.call(object, field)) throw new Error(`UI_PREFAB_OBJECT_FIELD_MISSING:${index}:${field}`);
        }
        for (const field of Object.keys(object)) {
            if (!knownFields.has(field)) throw new Error(`UI_PREFAB_OBJECT_FIELD_UNKNOWN:${index}:${field}`);
        }
        if (object.__type__ === 'cc.Node') nodes.push({ index, object });
        if (object.__type__ === 'cc.PrefabInfo' || object.__type__ === 'cc.CompPrefabInfo') {
            if (typeof object.fileId !== 'string' || object.fileId.length !== 22 || fileIds.has(object.fileId)) {
                throw new Error('UI_PREFAB_FILE_ID_INVALID');
            }
            fileIds.add(object.fileId);
        }
        const pending = [object];
        while (pending.length) {
            const value = pending.pop();
            if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`UI_PREFAB_NON_FINITE_NUMBER:${index}`);
            if (!value || typeof value !== 'object') continue;
            if (Object.prototype.hasOwnProperty.call(value, '__id__')
                && (!Number.isInteger(value.__id__) || value.__id__ < 0 || value.__id__ >= objects.length)) {
                throw new Error(`UI_PREFAB_REFERENCE_INVALID:${index}`);
            }
            for (const child of Object.values(value)) if (child && typeof child === 'object') pending.push(child);
        }
    }
    const expectedStructure = sortedBlueprint(blueprint, objects[0]._name);
    if (nodes.length !== expectedStructure.ordered.length) throw new Error('UI_PREFAB_NODE_COUNT_MISMATCH');
    const actualIndexByNodeId = new Map(expectedStructure.ordered.map((node, index) => [node.id, nodes[index].index]));
    for (let position = 0; position < nodes.length; position += 1) {
        const { index, object } = nodes[position];
        const expected = expectedStructure.ordered[position];
        if (object._name !== expected.name) throw new Error(`UI_PREFAB_NODE_MAPPING_INVALID:${expected.id}`);
        if (object._layer !== CREATOR_UI_2D_LAYER) throw new Error(`UI_PREFAB_LAYER_INVALID:${object._name}`);
        const expectedParent = expected.parentId === null ? null : actualIndexByNodeId.get(expected.parentId);
        if (expectedParent === null ? object._parent !== null : object._parent?.__id__ !== expectedParent) {
            throw new Error(`UI_PREFAB_PARENT_INVALID:${object._name}`);
        }
        const expectedChildren = expectedStructure.children.get(expected.id).map((child) => actualIndexByNodeId.get(child.id));
        if (object._children.map((ref) => ref.__id__).join('|') !== expectedChildren.join('|')) {
            throw new Error(`UI_PREFAB_CHILD_ORDER_INVALID:${object._name}`);
        }
        const components = object._components.map((ref) => objects[ref.__id__]);
        const uiTransform = components[0];
        if (!uiTransform || uiTransform.__type__ !== 'cc.UITransform') throw new Error(`UI_PREFAB_UI_TRANSFORM_MISSING:${object._name}`);
        if (components.some((component) => component.node.__id__ !== index)) throw new Error(`UI_PREFAB_COMPONENT_OWNER_INVALID:${object._name}`);
        const transform = expected.transform || {};
        const anchor = expected.anchor || {};
        if (object._lpos.x !== Number(transform.x) || object._lpos.y !== Number(transform.y)
            || object._lscale.x !== Number(transform.scaleX) || object._lscale.y !== Number(transform.scaleY)
            || object._euler.z !== Number(transform.rotation)
            || uiTransform._contentSize.width !== Number(transform.width) || uiTransform._contentSize.height !== Number(transform.height)
            || uiTransform._anchorPoint.x !== Number(anchor.x) || uiTransform._anchorPoint.y !== Number(anchor.y)) {
            throw new Error(`UI_PREFAB_TRANSFORM_MAPPING_INVALID:${object._name}`);
        }
        const expectedTypes = ['cc.UITransform'].concat(expected.components.map((component) => COMPONENT_TYPES[component.kind]));
        if (components.map((component) => component.__type__).join('|') !== expectedTypes.join('|')) {
            throw new Error(`UI_PREFAB_COMPONENT_MAPPING_INVALID:${object._name}`);
        }
        for (let componentIndex = 0; componentIndex < expected.components.length; componentIndex += 1) {
            const expectedComponent = expected.components[componentIndex];
            const actual = components[componentIndex + 1];
            const serialized = compileComponent(
                expectedComponent.kind, index, actual.__prefab.__id__, expectedComponent.properties || {}, materialBindings, transform,
            );
            if (JSON.stringify(actual) !== JSON.stringify(serialized)) {
                throw new Error(`UI_PREFAB_COMPONENT_PROPERTIES_INVALID:${object._name}:${expectedComponent.kind}`);
            }
        }
    }
    if (objects[0].data.__id__ !== actualIndexByNodeId.get(blueprint.rootId)) throw new Error('UI_PREFAB_ROOT_REFERENCE_INVALID');
    return true;
}

module.exports = {
    CREATOR_UI_2D_LAYER,
    CREATOR_PREFAB_PROFILE,
    assertBlueprint,
    compileCreatorPrefab,
    selectDocumentRoot,
    stableFileId,
    validateCompiledPrefab,
};
