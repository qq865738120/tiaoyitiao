(function () {
    'use strict';

    /**
     * 安装 Game Agent 预览页探针 Bridge，供 Browser helper 查询和操作 Cocos runtime。
     */(function installGameAgentPreviewBridgeProbe(){var namespace="__GAME_AGENT_PREVIEW_BRIDGE_PROBE__";if(globalThis[namespace]){return;}var checkpoints=[];var state=Object.create(null);var stateTruncated=Object.create(null);var targets=Object.create(null);var hooks={reset:null,setSeed:null};var nodeRefs=Object.create(null);var nodeRefIds=typeof WeakMap==="function"?new WeakMap():null;var nextNodeRefId=1;var lastScene=null;var sceneGeneration=0;var installedAt=Date.now();var bridgeRunToken=typeof globalThis.__GAME_AGENT_PREVIEW_BRIDGE_RUN_ID__==="string"&&globalThis.__GAME_AGENT_PREVIEW_BRIDGE_RUN_ID__?globalThis.__GAME_AGENT_PREVIEW_BRIDGE_RUN_ID__:installedAt.toString(36)+"-"+Math.random().toString(36).slice(2,8);var maxTreeCollect=1000;/**
         * 将未知值转换为有界、可 JSON 序列化的安全摘要。
         *
         * @param {*} value 待摘要值。
         * @param {number} depth 当前递归深度。
         * @returns {*} 可序列化摘要。
         */function jsonSafe(value,depth){if(depth>4)return "[depth-limit]";if(value===null||typeof value==="string"||typeof value==="number"||typeof value==="boolean"){return value;}if(Array.isArray(value)){return value.slice(0,20).map(function(item){return jsonSafe(item,depth+1);});}if(typeof value==="object"){var output={};Object.keys(value).slice(0,20).forEach(function(key){output[key]=jsonSafe(value[key],depth+1);});return output;}return String(value);}/** 计算JSON的UTF-8大小，不依赖Node或浏览器额外编码API。 */function jsonBytes(value){var text=JSON.stringify(value);var bytes=0;for(var index=0;index<text.length;index+=1){var code=text.charCodeAt(index);if(code<128)bytes+=1;else if(code<2048)bytes+=2;else if(code>=0xD800&&code<=0xDBFF&&index+1<text.length&&text.charCodeAt(index+1)>=0xDC00&&text.charCodeAt(index+1)<=0xDFFF){bytes+=4;index+=1;}else bytes+=3;}return bytes;}/** 发布/查询均从单个业务键根起算，只裁超限内容并记录事实，不造深度占位。 */function boundedStateValue(value,maxBytes){var meta={remaining:maxBytes,truncated:false};var seen=[];/** 递归复制单键状态并累计实际交付预算。 */function copy(item,depth){if(depth>4||meta.remaining<8){meta.truncated=true;return undefined;}if(typeof item==="string"){var chars=Array.from(item);if(chars.length>1000){item=chars.slice(0,1000).join("");meta.truncated=true;}}else if(typeof item==="number"&&!Number.isFinite(item)){meta.truncated=true;return undefined;}if(item===null||["string","number","boolean"].indexOf(typeof item)>=0){if(jsonBytes(item)+1>meta.remaining){if(typeof item!=="string"){meta.truncated=true;return undefined;}while(item.length&&jsonBytes(item)+1>meta.remaining)item=Array.from(item).slice(0,Math.floor(Array.from(item).length/2)).join("");meta.truncated=true;}meta.remaining-=jsonBytes(item)+1;return item;}if(!item||typeof item!=="object"||seen.indexOf(item)>=0){meta.truncated=true;return undefined;}seen.push(item);meta.remaining-=2;var array=Array.isArray(item);var result=array?[]:Object.create(null);var keys;try{keys=Object.keys(item);}catch(_){seen.pop();meta.truncated=true;return undefined;}if(keys.length>20)meta.truncated=true;keys.slice(0,20).forEach(function(key){if(!array){var cost=jsonBytes(key)+2;if(cost+8>meta.remaining){meta.truncated=true;return;}meta.remaining-=cost;}try{var child=copy(item[key],depth+1);if(child!==undefined){if(array)result.push(child);else result[key]=child;}}catch(_){meta.truncated=true;}});seen.pop();return result;}return {value:copy(value,0),truncated:meta.truncated};}/**
         * 查找预览页中的 Cocos runtime 入口对象。
         *
         * @returns {*} Cocos runtime 入口；不存在时返回空值。
         */function findCc(){return globalThis.cc||globalThis.window&&globalThis.window.cc;}/**
         * 生成节点在当前场景树中的可读路径。
         *
         * @param {*} node Cocos 节点。
         * @returns {string} 节点路径。
         */function nodePath(node){var names=[];var current=node;for(var i=0;current&&i<32;i+=1){names.unshift(String(current.name||"<unnamed>"));current=current.parent;}return names.join("/");}/**
         * 读取当前 active scene。
         *
         * @returns {*} 当前场景；不存在时返回 `undefined`。
         */function currentScene(){var cc=findCc();return cc&&cc.director&&typeof cc.director.getScene==="function"?cc.director.getScene():undefined;}/**
         * 读取 Cocos runtime 版本号。
         *
         * @param {*} cc Cocos runtime 入口。
         * @returns {string} 版本号字符串。
         */function cocosVersion(cc){return cc&&(cc.VERSION||cc.ENGINE_VERSION||cc.version)?String(cc.VERSION||cc.ENGINE_VERSION||cc.version):"";}/**
         * 判断当前 Cocos 版本是否超出 Preview Bridge 支持范围。
         *
         * @param {string} version Cocos 版本号。
         * @returns {boolean} 非 3.x 版本返回 `true`。
         */function unsupportedCocosVersion(version){return Boolean(version)&&!/^3\./.test(version);}/**
         * 检查预览页 runtime 是否满足查询或操作要求。
         *
         * @param {boolean} requireScene 是否要求 active scene 存在。
         * @returns {*} 健康检查结果。
         */function runtimeHealth(requireScene){var cc=findCc();if(!cc||!cc.director){return {ok:false,errorCode:"missing_runtime_objects",reason:"当前预览页没有可用的 Cocos runtime 入口或 director。"};}var version=cocosVersion(cc);if(unsupportedCocosVersion(version)){return {ok:false,errorCode:"unsupported_cocos_runtime",reason:"当前 Cocos runtime 版本不在 Preview Bridge 支持范围内。"};}var scene=currentScene();if(requireScene&&!scene){return {ok:false,errorCode:"missing_runtime_objects",reason:"当前 Cocos runtime 没有 active scene。"};}return {ok:true,cc:cc,scene:scene,version:version};}/**
         * 确保节点引用 generation 与当前场景一致，场景切换时清空旧引用。
         *
         * @returns {*} 当前场景和 scene generation。
         */function ensureSceneGeneration(){var scene=currentScene();if(scene!==lastScene){lastScene=scene||null;sceneGeneration+=1;nodeRefs=Object.create(null);nodeRefIds=typeof WeakMap==="function"?new WeakMap():null;nextNodeRefId=1;}return {scene:scene,generation:sceneGeneration};}/**
         * 为当前 generation 中的节点生成稳定引用 id。
         *
         * @param {*} node Cocos 节点。
         * @returns {string} 节点引用 id。
         */function makeNodeRef(node){ensureSceneGeneration();if(nodeRefIds){var existing=nodeRefIds.get(node);if(existing)return existing;}var id="node:"+bridgeRunToken+":"+sceneGeneration+":"+(nextNodeRefId+=1);nodeRefs[id]={node:node,generation:sceneGeneration};if(nodeRefIds)nodeRefIds.set(node,id);return id;}/**
         * 根据节点引用 id 解析当前 generation 中的节点。
         *
         * @param {*} ref 节点引用 id。
         * @returns {*} 解析结果。
         */function resolveNodeRef(ref){ensureSceneGeneration();var entry=nodeRefs[String(ref||"")];if(!entry||entry.generation!==sceneGeneration||!entry.node){return {ok:false,errorCode:"stale_node_ref",reason:"节点引用已经失效或不属于当前预览场景 generation。"};}return {ok:true,node:entry.node};}/**
         * 读取节点组件名称摘要。
         *
         * @param {*} node Cocos 节点。
         * @returns {string[]} 组件名称列表。
         */function componentNames(node){var components=node&&(node.components||node._components||node.__comps__);if(!Array.isArray(components))return [];return components.slice(0,12).map(function(component){return String(component&&(component.name||component.__classname__||component.constructor&&component.constructor.name||"Component"));});}/**
         * 生成单个组件的有界摘要。
         *
         * @param {*} component Cocos 组件。
         * @param {number} index 组件索引。
         * @returns {*} 组件摘要；组件为空时返回 `undefined`。
         */function summarizeComponent(component,index){if(!component)return undefined;var type=String(component.name||component.__classname__||component.constructor&&component.constructor.name||"Component");var summary={index:index,type:type,enabled:typeof component.enabled==="boolean"?component.enabled:undefined};if(typeof component.string==="string")summary.text=component.string.slice(0,500);if(typeof component.placeholder==="string")summary.placeholder=component.placeholder.slice(0,200);if(typeof component.interactable==="boolean")summary.interactable=component.interactable;return summary;}/**
         * 生成节点组件列表摘要。
         *
         * @param {*} node Cocos 节点。
         * @returns {*[]} 组件摘要列表。
         */function componentSummaries(node){var components=node&&(node.components||node._components||node.__comps__);if(!Array.isArray(components))return [];return components.slice(0,20).map(function(component,index){return summarizeComponent(component,index);}).filter(Boolean);}/**
         * 用公开世界点变换修正 Creator 3.7 的 UI 子树包围盒，拒绝不完整或无效几何。
         *
         * @param {*} node 当前 UI 节点。
         * @param {*} cc 当前运行时命名空间。
         * @returns {*} 完整世界矩形；无法可靠计算时返回 `undefined`。
         */function creator37WorldRect(node,cc){var pending=[node];var visited=0;var bounds;while(pending.length){if(++visited>maxTreeCollect)return undefined;var current=pending.pop();var ui=current&&typeof current.getComponent==="function"?current.getComponent(cc.UITransform||"cc.UITransform"):null;if(!ui)continue;var size=ui.contentSize;var anchor=ui.anchorPoint;if(!size||!anchor||typeof ui.convertToWorldSpaceAR!=="function")return undefined;var width=Number(size.width);var height=Number(size.height);var anchorX=Number(anchor.x);var anchorY=Number(anchor.y);if(![width,height,anchorX,anchorY].every(Number.isFinite)||width<0||height<0)return undefined;if(width&&height){for(var corner=0;corner<4;corner+=1){var x=((corner&1)-anchorX)*width;var y=((corner>>1)-anchorY)*height;var local=typeof cc.Vec3==="function"?new cc.Vec3(x,y,0):{x:x,y:y,z:0};var point=ui.convertToWorldSpaceAR(local);if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return undefined;if(!bounds)bounds={left:point.x,right:point.x,bottom:point.y,top:point.y};else {bounds.left=Math.min(bounds.left,point.x);bounds.right=Math.max(bounds.right,point.x);bounds.bottom=Math.min(bounds.bottom,point.y);bounds.top=Math.max(bounds.top,point.y);}}}var children=Array.isArray(current.children)?current.children:[];for(var index=0;index<children.length;index+=1){if(children[index]&&children[index].active&&children[index].activeInHierarchy!==false)pending.push(children[index]);}if(pending.length+visited>maxTreeCollect)return undefined;}return bounds?{x:bounds.left,y:bounds.bottom,width:bounds.right-bounds.left,height:bounds.top-bounds.bottom}:undefined;}/**
         * 读取节点 UITransform 的世界包围盒。
         *
         * @param {*} node Cocos 节点。
         * @returns {*} Cocos 世界矩形摘要；不可读取时返回 `undefined`。
         */function worldRect(node){var cc=findCc();if(!cc||!node||typeof node.getComponent!=="function")return undefined;if(/^3\.7\./.test(cocosVersion(cc)))return creator37WorldRect(node,cc);var uiTransform=cc.UITransform?node.getComponent(cc.UITransform):node.getComponent("cc.UITransform");if(!uiTransform||typeof uiTransform.getBoundingBoxToWorld!=="function")return undefined;var rect=uiTransform.getBoundingBoxToWorld();return rect?{x:Number(rect.x)||0,y:Number(rect.y)||0,width:Number(rect.width)||0,height:Number(rect.height)||0}:undefined;}/**
         * 将向量对象转换为数值摘要。
         *
         * @param {*} value 向量对象。
         * @returns {*} x/y/z 摘要；无效时返回 `undefined`。
         */function vectorSummary(value){if(!value||typeof value!=="object")return undefined;return {x:Number(value.x)||0,y:Number(value.y)||0,z:Number(value.z)||0};}/**
         * 读取节点世界坐标摘要。
         *
         * @param {*} node Cocos 节点。
         * @returns {*} 世界坐标摘要；不可读取时返回 `undefined`。
         */function nodeWorldPosition(node){if(!node)return undefined;return vectorSummary(node.worldPosition||(typeof node.getWorldPosition==="function"?node.getWorldPosition():undefined));}/**
         * 在场景树中查找可用于 worldToScreen 的 Camera。
         *
         * @param {*} node 搜索起点节点。
         * @returns {*} Camera 组件；不存在时返回 `undefined`。
         */function findCamera(node){var cc=findCc();if(!cc||!node)return undefined;if(typeof node.getComponent==="function"&&cc.Camera){var camera=node.getComponent(cc.Camera);if(camera)return camera;}var children=Array.isArray(node.children)?node.children:[];for(var i=0;i<children.length;i+=1){var childCamera=findCamera(children[i]);if(childCamera)return childCamera;}return undefined;}/**
         * 将世界坐标投影到 Cocos 渲染屏幕坐标。
         *
         * @param {*} world 世界坐标点。
         * @returns {*} Cocos 屏幕点摘要或错误摘要。
         */function worldToScreenPoint(world){if(!world)return undefined;var cc=findCc();if(!cc)return undefined;var scene=cc.director&&typeof cc.director.getScene==="function"?cc.director.getScene():undefined;var camera=findCamera(scene);if(!camera||typeof camera.worldToScreen!=="function")return undefined;try{var out=camera.worldToScreen(world);return out?{x:Number(out.x)||0,y:Number(out.y)||0,z:Number(out.z)||0}:undefined;}catch(error){return {error:error instanceof Error?error.message:String(error)};}}/**
         * 将节点世界坐标投影到 Cocos 渲染屏幕坐标。
         *
         * @param {*} node Cocos 节点。
         * @param {*} localPoint 可选本地偏移。
         * @returns {*} Cocos 屏幕点摘要或错误摘要。
         */function targetScreenPoint(node,localPoint){if(!node)return undefined;var world=nodeWorldPosition(node);if(!world)return undefined;if(localPoint){world={x:world.x+(Number(localPoint.x)||0),y:world.y+(Number(localPoint.y)||0),z:world.z+(Number(localPoint.z)||0)};}return worldToScreenPoint(world);}/**
         * 读取 Cocos 渲染 Canvas 的 backing-store 与 CSS 矩形。
         *
         * @returns {*} 可用的渲染表面摘要；不可读取时返回 `undefined`。
         */function renderSurface(){var cc=findCc();var canvas=cc&&cc.game&&cc.game.canvas;if((!canvas||typeof canvas.getBoundingClientRect!=="function")&&globalThis.document&&typeof globalThis.document.querySelector==="function"){canvas=globalThis.document.querySelector("canvas");}if(!canvas||typeof canvas.getBoundingClientRect!=="function")return undefined;try{var rect=canvas.getBoundingClientRect();var width=Number(canvas.width)||0;var height=Number(canvas.height)||0;var cssWidth=rect?Number(rect.width)||0:0;var cssHeight=rect?Number(rect.height)||0:0;if(!rect||width<=0||height<=0||cssWidth<=0||cssHeight<=0)return undefined;return {left:Number(rect.left)||0,top:Number(rect.top)||0,width:width,height:height,cssWidth:cssWidth,cssHeight:cssHeight};}catch(_error){return undefined;}}/**
         * 将 Cocos 屏幕坐标转换为浏览器坐标。
         *
         * @param {*} point Cocos 渲染屏幕点。
         * @param {*} surface 可选的 Canvas 渲染表面摘要。
         * @returns {*} 浏览器坐标点；输入无效时返回 `undefined`。
         */function toBrowserPoint(point,surface){if(!point||typeof point.x!=="number"||typeof point.y!=="number")return undefined;var currentSurface=surface||renderSurface();if(currentSurface){return {x:currentSurface.left+(Number(point.x)||0)*currentSurface.cssWidth/currentSurface.width,y:currentSurface.top+(currentSurface.height-(Number(point.y)||0))*currentSurface.cssHeight/currentSurface.height};}return {x:Number(point.x)||0,y:Math.max(0,(Number(globalThis.innerHeight)||0)-(Number(point.y)||0))};}/**
         * 将节点 UITransform 世界包围盒投影为浏览器 viewport CSS 矩形。
         *
         * @param {*} node Cocos 节点。
         * @returns {*} 浏览器 CSS 矩形摘要；不可投影时返回 `undefined`。
         */function screenRect(node){var rect=worldRect(node);if(!rect)return undefined;var worldPosition=nodeWorldPosition(node);var z=worldPosition?worldPosition.z:0;var surface=renderSurface();var first=toBrowserPoint(worldToScreenPoint({x:rect.x,y:rect.y,z:z}),surface);var second=toBrowserPoint(worldToScreenPoint({x:rect.x+rect.width,y:rect.y+rect.height,z:z}),surface);if(!first||!second)return undefined;var left=Math.min(first.x,second.x);var top=Math.min(first.y,second.y);return {x:left,y:top,width:Math.max(first.x,second.x)-left,height:Math.max(first.y,second.y)-top};}/**
         * 解析节点或注册 target 的语义指针输入目标。
         *
         * @param {*} params 指针目标参数。
         * @returns {*} 可供 Browser helper 使用的目标点或错误结果。
         */function nodePointerTarget(params){var generation=ensureSceneGeneration();var node;var targetKind;var targetId;if(params&&params.targetId){var registered=targets[String(params.targetId)];if(!registered||!registered.node){return {ok:false,errorCode:"registered_target_missing",reason:"项目没有注册指定的语义 3D targetId。"};}node=registered.node;targetKind="registered_target";targetId=String(params.targetId);var projected=targetScreenPoint(node,registered.localPoint);if(!projected||projected.error){return {ok:false,errorCode:"target_not_projectable",reason:"项目注册目标当前无法投影到预览页屏幕坐标。"};}return {ok:true,sceneGeneration:generation.generation,targetKind:targetKind,targetId:targetId,nodeRef:makeNodeRef(node),path:registered.path,point:toBrowserPoint(projected)};}var resolved=resolveNodeRef(params&&params.nodeRef);if(!resolved.ok)return resolved;node=resolved.node;targetKind="node";if(!node.active||node.activeInHierarchy===false){return {ok:false,errorCode:"node_not_interactable",reason:"目标节点当前未激活，不能执行语义输入。"};}var rect=screenRect(node);if(!rect||rect.width<=0||rect.height<=0){return {ok:false,errorCode:"node_not_interactable",reason:"目标节点没有可用的 2D 屏幕矩形。"};}return {ok:true,sceneGeneration:generation.generation,targetKind:targetKind,nodeRef:String(params&&params.nodeRef||""),path:nodePath(node),screenRect:rect,point:{x:rect.x+rect.width/2,y:rect.y+rect.height/2}};}/**
         * 解析节点文本输入目标，并校验 EditBox 组件可用性。
         *
         * @param {*} params 输入目标参数。
         * @returns {*} 可输入目标摘要或错误结果。
         */function nodeInputTarget(params){var target=nodePointerTarget(params||{});if(!target.ok)return target;if(target.targetKind!=="node"){return {ok:false,errorCode:"unsupported_node_input",reason:"注册的 3D target 不支持文本输入。"};}var resolved=resolveNodeRef(params&&params.nodeRef);if(!resolved.ok)return resolved;var cc=findCc();var editBox=resolved.node&&typeof resolved.node.getComponent==="function"?cc&&cc.EditBox?resolved.node.getComponent(cc.EditBox):resolved.node.getComponent("cc.EditBox"):undefined;if(!editBox||editBox.enabled===false){return {ok:false,errorCode:"unsupported_node_input",reason:"目标节点没有启用的 EditBox 组件。"};}target.value=typeof editBox.string==="string"?editBox.string.slice(0,500):undefined;return target;}/**
         * 执行 runtime 控制操作，例如暂停、恢复、重置和设置随机种子。
         *
         * @param {*} params runtime 控制参数。
         * @returns {Promise<*>} 操作结果。
         */async function runtimeControl(params){var operation=params&&params.operation;var health=runtimeHealth(false);if(!health.ok)return health;var director=health.cc&&health.cc.director;if(operation==="pause"){if(typeof director.pause!=="function")return {ok:false,errorCode:"unsupported_runtime",reason:"当前 Cocos runtime 不支持 pause。"};director.pause();return {ok:true,operation:operation,paused:true,sceneGeneration:ensureSceneGeneration().generation};}if(operation==="resume"){if(typeof director.resume!=="function")return {ok:false,errorCode:"unsupported_runtime",reason:"当前 Cocos runtime 不支持 resume。"};director.resume();return {ok:true,operation:operation,paused:false,sceneGeneration:ensureSceneGeneration().generation};}if(operation==="reset"){if(typeof hooks.reset!=="function")return {ok:false,errorCode:"unsupported_hook",hook:"reset",reason:"项目没有通过 registerHooks 注册 reset hook。"};await hooks.reset();return {ok:true,operation:operation,sceneGeneration:ensureSceneGeneration().generation};}if(operation==="set_seed"){if(typeof hooks.setSeed!=="function")return {ok:false,errorCode:"unsupported_hook",hook:"setSeed",reason:"项目没有通过 registerHooks 注册 setSeed hook。"};await hooks.setSeed(params&&params.seed);return {ok:true,operation:operation,seed:Number(params&&params.seed),sceneGeneration:ensureSceneGeneration().generation};}return {ok:false,errorCode:"unsupported_runtime_operation",reason:"Preview Bridge 不支持该 runtime operation。"};}/**
         * 分发 Preview Bridge runtime 操作。
         *
         * @param {string} action 操作名称。
         * @param {*} params 操作参数。
         * @returns {Promise<*>} 操作结果。
         */async function operate(action,params){try{if(action==="nodePointer")return nodePointerTarget(params||{});if(action==="nodeInput")return nodeInputTarget(params||{});if(action==="runtimeControl")return runtimeControl(params||{});return {ok:false,errorCode:"unsupported_runtime_operation",reason:"Preview Bridge 不支持该 runtime operation。"};}catch(error){return {ok:false,errorCode:"runtime_operation_failed",reason:error instanceof Error?error.message:String(error)};}}/**
         * 递归生成简版节点树摘要。
         *
         * @param {*} node 当前节点。
         * @param {number} depth 当前深度。
         * @param {*[]} output 输出数组。
         */function summarizeNode(node,depth,output){if(!node||output.length>=100||depth>4)return;output.push({ref:makeNodeRef(node),name:String(node.name||""),path:nodePath(node),active:Boolean(node.active),components:componentNames(node),screenRect:screenRect(node),childCount:Array.isArray(node.children)?node.children.length:0});var children=Array.isArray(node.children)?node.children:[];children.slice(0,20).forEach(function(child){summarizeNode(child,depth+1,output);});}/**
         * 递归生成带分页和过滤能力的节点树摘要。
         *
         * @param {*} node 当前节点。
         * @param {number} depth 当前深度。
         * @param {number} maxDepth 最大深度。
         * @param {*[]} output 输出数组。
         * @param {number} limit 最大收集数量。
         * @param {*} predicate 可选过滤函数。
         */function summarizeNodeBounded(node,depth,maxDepth,output,limit,predicate){if(!node||output.length>=limit||depth>maxDepth)return;var summary={ref:makeNodeRef(node),name:String(node.name||""),path:nodePath(node),active:Boolean(node.active),activeInHierarchy:typeof node.activeInHierarchy==="boolean"?node.activeInHierarchy:undefined,layer:typeof node.layer==="number"?node.layer:undefined,worldPosition:nodeWorldPosition(node),screenPoint:targetScreenPoint(node),components:componentSummaries(node),screenRect:screenRect(node),childCount:Array.isArray(node.children)?node.children.length:0,depth:depth};if(!predicate||predicate(summary,node)){output.push(summary);}var children=Array.isArray(node.children)?node.children:[];children.slice(0,100).forEach(function(child){summarizeNodeBounded(child,depth+1,maxDepth,output,limit,predicate);});}/**
         * 返回 Preview Bridge 安装状态和当前 runtime 基本信息。
         *
         * @returns {*} runtime 信息摘要。
         */function runtimeInfo(){var cc=findCc();var generation=ensureSceneGeneration();var scene=generation.scene;var version=cocosVersion(cc);return {ok:true,installed:true,installedAt:installedAt,hasCc:Boolean(cc),cocosVersion:version,hasScene:Boolean(scene),sceneName:scene?String(scene.name||""):"",sceneGeneration:generation.generation,viewport:{width:Number(globalThis.innerWidth)||0,height:Number(globalThis.innerHeight)||0,devicePixelRatio:Number(globalThis.devicePixelRatio)||1}};}/**
         * 查询当前场景节点树、搜索结果或可点击节点集合。
         *
         * @param {*} params 查询参数。
         * @returns {*} 节点树查询结果。
         */function queryTree(params){var generation=ensureSceneGeneration();var output=[];var operation=params&&params.operation||"tree";if(Number(params&&params.limit)>200||Number(params&&params.cursor)>maxTreeCollect){return {ok:false,errorCode:"oversized_output",reason:"运行态查询请求超过 Preview Bridge 单次输出上限。"};}var limit=Math.max(1,Math.min(Number(params&&params.limit)||50,200));var maxDepth=Math.max(0,Math.min(Number(params&&params.maxDepth)||4,12));var offset=Math.max(0,Math.min(Number(params&&params.cursor)||0,maxTreeCollect));var collectLimit=Math.min(offset+limit+1,maxTreeCollect);var term=String(params&&params.query||"").toLowerCase();var predicate;if(operation==="search"){predicate=function(summary){return !term||summary.name.toLowerCase().indexOf(term)>=0||summary.path.toLowerCase().indexOf(term)>=0;};}else if(operation==="clickable"){predicate=function(summary){return summary.active&&summary.screenRect&&summary.screenRect.width>0&&summary.screenRect.height>0;};}summarizeNodeBounded(generation.scene,0,maxDepth,output,collectLimit,predicate);var nodes=output.slice(offset,offset+limit);var hasMore=output.length>offset+limit;return {ok:true,operation:operation,sceneGeneration:generation.generation,sceneName:generation.scene?String(generation.scene.name||""):"",nodes:nodes,nextCursor:hasMore?String(offset+limit):undefined,truncated:hasMore};}/**
         * 查询单个节点的详细摘要。
         *
         * @param {*} params 节点查询参数。
         * @returns {*} 节点查询结果。
         */function queryNode(params){var generation=ensureSceneGeneration();var resolved=resolveNodeRef(params&&params.nodeRef);if(!resolved.ok)return resolved;var output=[];summarizeNodeBounded(resolved.node,0,1,output,1,undefined);return {ok:true,sceneGeneration:generation.generation,sceneName:generation.scene?String(generation.scene.name||""):"",node:output[0]||null};}/**
         * 查询节点组件摘要或指定组件摘要。
         *
         * @param {*} params 组件查询参数。
         * @returns {*} 组件查询结果。
         */function queryComponent(params){var generation=ensureSceneGeneration();var resolved=resolveNodeRef(params&&params.nodeRef);if(!resolved.ok)return resolved;var components=componentSummaries(resolved.node);if(typeof(params&&params.componentIndex)==="number"){return {ok:true,sceneGeneration:generation.generation,nodeRef:String(params&&params.nodeRef||""),component:components[params.componentIndex]||null};}return {ok:true,sceneGeneration:generation.generation,nodeRef:String(params&&params.nodeRef||""),components:components};}/**
         * 查询测试探针记录的 checkpoint、状态和注册 target。
         *
         * @param {*} params 测试状态查询参数。
         * @returns {*} 测试状态摘要。
         */function queryTestState(params){var limit=Math.max(1,Math.min(Number(params&&params.limit)||20,100));var requested=params&&Array.isArray(params.keys)?Array.from(new Set(params.keys)):Object.keys(state);var result={ok:true,checkpoints:checkpoints.slice(-limit),state:Object.create(null),registeredTargets:Object.keys(targets).slice(0,50).map(function(id){var target=targets[id];return {id:id,label:target.label,path:target.path,localPoint:target.localPoint,screenPoint:targetScreenPoint(target.node,target.localPoint)};}),truncated:false};/** 有界记录缺失或裁剪键，不让元信息撑大结果。 */function note(field,key){if(!result[field])result[field]=[];if(result[field].length<16&&key.length<=128)result[field].push(key);else result[field+"_omitted_count"]=(result[field+"_omitted_count"]||0)+1;}// Reserve room for selected business state before fitting optional checkpoint/target details.
    while(jsonBytes(result)>2000&&(result.checkpoints.length||result.registeredTargets.length)){var field=result.checkpoints.length?"checkpoints":"registeredTargets";result[field].pop();var counter=field==="checkpoints"?"omitted_checkpoints":"omitted_targets";result[counter]=(result[counter]||0)+1;result.truncated=true;}requested.forEach(function(key){key=String(key);if(!Object.prototype.hasOwnProperty.call(state,key)){note("missing_keys",key);return;}var remaining=7600-jsonBytes(result)-jsonBytes(key)-128;if(remaining<16||state[key]===undefined){note("omitted_keys",key);result.truncated=true;return;}var bounded=boundedStateValue(state[key],remaining);if(bounded.value===undefined){note("omitted_keys",key);result.truncated=true;return;}result.state[key]=bounded.value;if(stateTruncated[key]||bounded.truncated){note("truncated_keys",key);result.truncated=true;}});// Metadata names share the budget; omitted counts keep their incompleteness explicit.
    ["missing_keys","truncated_keys","omitted_keys"].forEach(function(field){while(jsonBytes(result)>7900&&result[field]&&result[field].length){result[field].pop();result[field+"_omitted_count"]=(result[field+"_omitted_count"]||0)+1;result.truncated=true;}});return result;}/**
         * 分发 Preview Bridge runtime 查询。
         *
         * @param {string} action 查询名称。
         * @param {*} params 查询参数。
         * @returns {*} 查询结果。
         */function query(action,params){try{if(action==="runtime")return runtimeInfo();var health=runtimeHealth(action!=="testState");if(!health.ok)return health;if(action==="tree")return queryTree(params||{});if(action==="node")return queryNode(params||{});if(action==="component")return queryComponent(params||{});if(action==="testState")return queryTestState(params||{});return {ok:false,errorCode:"unsupported_runtime_query",reason:"Preview Bridge 不支持该 runtime query。"};}catch(error){return {ok:false,errorCode:"runtime_query_failed",reason:error instanceof Error?error.message:String(error)};}}/**
         * 创建完整预览探针快照。
         *
         * @returns {*} 当前 runtime、节点、checkpoint 和注册 target 摘要。
         */function snapshot(){var cc=findCc();var scene=cc&&cc.director&&typeof cc.director.getScene==="function"?cc.director.getScene():undefined;var nodes=[];summarizeNode(scene,0,nodes);return {installed:true,hasCc:Boolean(cc),hasScene:Boolean(scene),sceneName:scene?String(scene.name||""):"",nodeCount:nodes.length,nodes:nodes.slice(0,50),checkpoints:checkpoints.slice(-20),state:queryTestState({limit:20}).state,registeredTargets:Object.keys(targets).slice(0,50).map(function(id){var target=targets[id];return {id:id,label:target.label,path:target.path,localPoint:target.localPoint,screenPoint:targetScreenPoint(target.node,target.localPoint)};})};}globalThis.__GAME_AGENT_TEST__={/**
             * 记录一条测试 checkpoint。
             *
             * @param {*} name checkpoint 名称。
             * @param {*} detail checkpoint 详情。
             */checkpoint:function checkpoint(name,detail){checkpoints.push({name:String(name),detail:jsonSafe(detail,0),at:Date.now()});},/**
             * 写入一项测试状态。
             *
             * @param {*} key 状态 key。
             * @param {*} value 状态值。
             */setState:function setState(key,value){var bounded;try{bounded=boundedStateValue(value,8192);}catch(_){bounded={value:undefined,truncated:true};}state[String(key)]=bounded.value;stateTruncated[String(key)]=bounded.truncated;},/**
             * 清理指定测试状态或全部测试状态。
             *
             * @param {*} key 可选状态 key。
             */clearState:function clearState(key){if(typeof key==="string"){delete state[key];delete stateTruncated[key];}else {state=Object.create(null);stateTruncated=Object.create(null);}},/**
             * 注册项目自定义 runtime 控制 hook。
             *
             * @param {*} nextHooks reset 和 setSeed hook 集合。
             * @returns {*} 已启用 hook 状态。
             */registerHooks:function registerHooks(nextHooks){hooks={reset:nextHooks&&typeof nextHooks.reset==="function"?nextHooks.reset:null,setSeed:nextHooks&&typeof nextHooks.setSeed==="function"?nextHooks.setSeed:null};return {ok:true,reset:Boolean(hooks.reset),setSeed:Boolean(hooks.setSeed)};},/**
             * 注册语义 3D 输入 target。
             *
             * @param {*} target target 定义，包含 id 和 node。
             * @returns {*} 注册结果。
             */registerTarget:function registerTarget(target){if(!target||typeof target.id!=="string"||!target.node){return {ok:false,errorCode:"invalid_target",reason:"registerTarget 需要 id 和 node。"};}var localPoint=vectorSummary(target.localPoint);targets[target.id]={label:target.label?String(target.label):"",node:target.node,localPoint:localPoint,path:nodePath(target.node)};return {ok:true,id:target.id,label:target.label?String(target.label):"",hasLocalPoint:Boolean(localPoint)};}};globalThis[namespace]={installedAt:installedAt,snapshot:snapshot,query:query,operate:operate};})();

})();
