'use strict';

const { contextClient, publishJson, readStdinJson, safeId } = require('./lib/runtime.cjs');

/** 编译单次四象限生图要求，以原位覆盖层约束普通文字，核对数据不参与排版。 */
function compactPrompt(intent) {
    const semantic = intent.elements.map((item) => `${item.semanticKey}:${item.name}:${item.role}${item.text ? `=${item.text}` : ''}`).join('|');
    const ordinary = intent.elements.filter((item) => item.role === 'label').map((item) => ({ 用途: item.name, 文字: item.text }));
    const art = intent.elements.filter((item) => item.role === 'artistic-text').map((item) => `${item.name}="${item.text}"`).join('；');
    const required = intent.requiredElements.join('、');
    const exact = intent.exactTexts.join('、');
    const base = [
        '【页面功能与内容权威】',
        `生成${intent.canvas.width}x${intent.canvas.height}目标画布的${intent.genre}游戏UI：${intent.pagePurpose}`,
        `目标画布是单个象限，不是整张图。期望整图${intent.canvas.width * 2}x${intent.canvas.height * 2}像素；实际像素尺寸以API的size参数为准。整图按宽高各50%划分为2×2四个等大象限，不留外边距、不加标题或说明。`,
        required ? `必须包含：${required}` : '',
        exact ? `精确普通文字：${exact}` : '',
        art ? `本页艺术字白名单仅为：${art}。其它文字（包括普通标题）全部属于T，不能因字号大或处于顶部而改为艺术字。`
            : '本页没有艺术字。标题、奖励数值与按钮文案全部是普通文字T，只在左上和右下出现；左下不得出现任何字形，包括顶部标题。',
        semantic ? `语义节点：${semantic}\n以上节点ID、名称、角色和字段分隔符仅用于理解UI结构，不作为额外文字或清单绘制；实际文字内容按下方核对数据与艺术字要求绘制。` : '',
        '先从上述需求确认玩家在本页要完成的任务，安排主要信息、主要操作、辅助操作的先后关系。按钮与所属文字、图标与所属数值一一对应，主要操作易于辨认。仅呈现已确认语义，不为凑齐常见页面结构添加资源栏、价格、倒计时、导航、额外按钮或示例文案。',
        '【统一视觉语言】',
        intent.references.length ? `风格参考：${intent.references.join('、')}` : '',
        intent.referenceObservation ? `参考图观察：${intent.referenceObservation}` : '',
        '在功能布局确定后统一主色、强调色、控件形状、材质、边缘光影与字重。强调色服务主要操作，背景降低细节密度和对比，完整角色或道具服务页面任务，避免遮挡信息。参考图按用户要求提供风格或布局依据，不能替换冻结文案和功能。',
        '普通文字T采用平面、清晰的普通字体，标题通过字号和字重建立层级，单色填充，可带紧贴字形的细描边。普通文字不使用挤出厚度、金属材质、斜面浮雕或装饰性艺术字造型；控件和插画的材质风格不应用到普通字形。',
        '按钮与卡片要有清晰独立的边界和充足内边距，普通文字完整易读，数字与对应信息靠近；长文案预留空间。相邻按钮、卡片和动态图标之间保留透明间隙，不能用连续光效或装饰连成不可拆的整片。只显示当前一个状态，不绘制多个按钮状态样本。',
        '【四象限交付与原位分层】',
        `交付一张四象限分层图。先把内容分成三类：B=纯静态背景；U=无字UI底板、按钮、图标、角色${art ? '和白名单中的完整艺术字' : '，不含任何文字'}；T=普通文字字形。一个完整带字按钮必须拆为U中的无字底板和T中的字形，不能作为一个整体复制。`,
        '象限合成表：左上完整效果图=B+U+T；右上纯背景=B；左下透明底UI元素图=U；右下透明底纯普通文字图=T。内容出现位置严格限定：背景只在左上和右上出现；UI及艺术字只在左上和左下出现；普通文字只在左上和右下出现。四个象限不是四套完整界面，不得复制整套UI到下方。表中的字母和公式只是制作说明，禁止画入图片。',
        '四区使用同一局部坐标系；每层实际保留的内容与左上对应部分的位置、尺寸和样式一致。下方两区是左上画面的原位分层，不得重新排列、居中、放大或排成素材表；位置一致不等于复制带文字的完整控件。',
        '右下是左上普通文字的原位透明覆盖层，仅作为辅助参考：从一张完全空白的透明画布开始，只复制普通文字字形，尽量保持左上的局部位置、字号、颜色、描边、换行、对齐和字间距；不画成文字清单。',
        '右下尽量去掉承载文字的UI控件，只保留字形及紧贴的描边；不要复制按钮底板、资源条、图标或插画。右下移除控件后，文字仍停在左上原来的位置；底部导航文字保持原有横向分布，以实际已有内容为准。',
        '优先保证左上内容完整、右上背景干净、左下图标和按钮可用。右下不要求逐像素完全重合，少量缺字、样式或位置误差可由原生文字重建处理；不要为了完善右下而删除左上的文字、移动左下控件或重画其它象限。',
        '左下从空白透明画布只绘制U：每个按钮都是完整的无字状态，保留底板纹理、颜色、边缘及投影，不留文字形状的孔洞。左下必须移除所有普通文字，包括昵称、资源数值、主按钮文字和底部小按钮/导航文字；贴在图标旁或徽章上的小字也属于T。只有明确列为艺术字的标题保留在U。',
        ordinary.length ? `普通文字内容核对数据：${JSON.stringify(ordinary)}。此数据仅用于核对用途与文字内容，不指定位置或阅读顺序。字段名、等号、数据分隔符和清单排版不得画入图片；右下只保留这些文字在左上对应位置的字形。` : '没有普通文字内容时右下整区留空，不添加示例文字。',
        art ? `左下必须保留完整艺术字像素：${art}。这是图片部件，不是普通文字，右下绝对不能出现这些标题。` : '',
        '先确定B、U、T的原位布局，再在左上合成完整效果，另外三区分别只显示B、U、T。逐项检查每类内容只在规定的两个象限出现。重叠且无法独立还原的装饰作为完整一组图片；每个可交互按钮独立，按钮底板尽量不要连接其它按钮。',
        '左上和右上保留完整不透明背景；下方无内容区域的最终提取结果须为Alpha=0，元素边缘保留半透明。禁止把棋盘格、灰白网格、白底或透明示意图画进像素。',
        intent.transparencyFallback.keyColorIsBackground
            ? '本次明确采用已授权的纯洋红键色编码透明：输出PNG，左下和右下所有空白统一填为均匀纯洋红#FF00FF，包括字符内部空隙和控件之间。该色仅用于空白，主体、文字和投影不得使用；禁止渐变、纹理、棋盘格和灰白底。前文透明画布指最终提取效果，本次图中这些空白全部用同一纯洋红表达，后续确定性抠图会将其移除。上下文中的图层内容归属和原位位置保持不变。'
            : '本次输出带真实Alpha通道的PNG，下方空白必须是实际Alpha=0像素；主体保留用户要求的颜色，不得使用洋红色键备用。',
        '用约2px黑色水平线和垂直线分隔中心；所有元素不得越线。左上是后续核对的视觉标准。',
        '【完成前自检】先核对主要信息和操作，再核对每条文案的唯一位置、独立控件边界及四象限内容归属。避免重复卡片、缺字、重影、破损边框、夸张透视和遮字光效；输出完整可拆分游戏界面，不额外绘制设计说明、功能表、色板、参考缩略图或设备外壳。',
    ].filter(Boolean).join('\n');
    return base;
}

function reconcileIntent(parameters, brief, draft) {
    const exactTexts = [...brief.request.exactTexts];
    const requiredElements = [...brief.request.requiredElements];
    const elements = [];
    const ids = new Set();
    const source = Array.isArray(draft && draft.elements) ? draft.elements : [];
    for (let index = 0; index < source.length; index += 1) {
        const item = source[index] || {};
        const semanticKey = safeId(item.semanticKey || item.id || `element-${index + 1}`, 'element');
        if (ids.has(semanticKey)) continue;
        ids.add(semanticKey);
        const role = ['container', 'sprite', 'button', 'label', 'artistic-text'].includes(item.role)
            ? item.role : 'sprite';
        const exactText = role === 'label' && typeof item.text === 'string'
            ? exactTexts.find((value) => value === item.text.trim()) : undefined;
        elements.push({
            id: semanticKey,
            semanticKey,
            name: String(item.name || semanticKey).slice(0, 120),
            role,
            interactive: role === 'button' || item.interactive === true,
            text: exactText || (['label', 'artistic-text'].includes(role) && typeof item.text === 'string' ? item.text.trim() : ''),
            edgeIntent: ['left', 'right', 'top', 'bottom', 'center', 'none'].includes(item.edgeIntent)
                ? item.edgeIntent : 'none',
        });
    }
    if (!elements.some((item) => item.role === 'container')) {
        elements.unshift({ id: 'root-content', semanticKey: 'root-content', name: 'UI内容根', role: 'container', interactive: false, text: '', edgeIntent: 'none' });
    }
    for (const required of requiredElements) {
        const normalized = safeId(required, 'required');
        if (elements.some((item) => item.semanticKey === normalized || item.name === required)) continue;
        const role = /(?:按钮|button)/i.test(required) ? 'button' : 'sprite';
        elements.push({
            id: normalized, semanticKey: normalized, name: required.slice(0, 120), role,
            interactive: role === 'button', text: '', edgeIntent: 'none',
        });
    }
    for (let index = 0; index < exactTexts.length; index += 1) {
        const value = exactTexts[index];
        if (elements.some((item) => item.role === 'label' && item.text === value)) continue;
        const semanticKey = `exact-text-${index + 1}`;
        elements.push({ id: semanticKey, semanticKey, name: value.slice(0, 120), role: 'label', interactive: false, text: value, edgeIntent: 'none' });
    }
    if (elements.some((item) => item.semanticKey === 'ui-root')) {
        throw new Error('UI_INTENT_RESERVED_ROOT_ID');
    }
    const intent = {
        transparencyFallback: {
            rgb: [255, 0, 255],
            keyColorIsBackground: !parameters.referenceUiImage && !/(?:洋红|品红|magenta|fuchsia|#ff00ff|255\s*,\s*0\s*,\s*255)/i.test(JSON.stringify(brief.request)),
        },
        schema: 'game-agent.ui-generation-intent/v2',
        schemaVersion: 2,
        canvas: brief.canvas,
        pagePurpose: brief.request.description,
        genre: brief.request.genre,
        references: brief.request.references,
        requiredElements,
        exactTexts,
        elements,
        referenceObservation: String(draft && draft.referenceObservation || '').slice(0, 1000),
        semanticAuthority: 'user-input',
        visualAuthority: 'future-composite-top-left',
    };
    const imageRequest = {
        version: 1,
        prompt: compactPrompt(intent),
        count: 1,
        background: 'transparent',
        profilePreference: 'highest-compatible',
        targetCanvasWidth: intent.canvas.width,
        targetCanvasHeight: intent.canvas.height,
        references: parameters.referenceUiImage ? [parameters.referenceUiImage] : [],
    };
    return { intent, imageRequest };
}

async function main() {
    const input = await readStdinJson();
    const result = reconcileIntent(input.parameters || {}, input.brief || {}, input.draft || {});
    const lineage = [input.briefArtifact, input.parameters && input.parameters.referenceUiImage].filter(Boolean);
    const intentArtifact = await publishJson(contextClient(), result.intent, 'game-agent.ui-generation-intent/v2', lineage, input.brief.publication.retentionDays);
    process.stdout.write(JSON.stringify({ ...result, intentArtifact }));
}

if (require.main === module) main().catch((error) => {
    process.stderr.write(String(error && error.message || error));
    process.exitCode = 1;
});

module.exports = { compactPrompt, reconcileIntent };
