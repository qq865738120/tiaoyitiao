'use strict';

var require$$0$2 = require('child_process');
var require$$0$1 = require('path');
var require$$0 = require('fs');
var process$2 = require('process');
var node_stream = require('stream');
var node_crypto = require('crypto');
var path = require('path');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

// src/errors/ai-sdk-error.ts
var marker$1="vercel.ai.error";var symbol$1=Symbol.for(marker$1);var _a$3,_b$1;var AISDKError=class _AISDKError extends(_b$1=Error,_a$3=symbol$1,_b$1){/**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */constructor({name:name15,message,cause}){super(message);this[_a$3]=true;this.name=name15;this.cause=cause;}/**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */static isInstance(error){return _AISDKError.hasMarker(error,marker$1);}static hasMarker(error,marker16){const markerSymbol=Symbol.for(marker16);return error!=null&&typeof error==="object"&&markerSymbol in error&&typeof error[markerSymbol]==="boolean"&&error[markerSymbol]===true;}};// src/errors/api-call-error.ts
function getErrorMessage(error){if(error==null){return "unknown error";}if(typeof error==="string"){return error;}if(error instanceof Error){return error.toString();}return JSON.stringify(error);}// src/errors/invalid-argument-error.ts
var name3="AI_InvalidArgumentError";var marker4=`vercel.ai.error.${name3}`;var symbol4=Symbol.for(marker4);var _a4,_b4;var InvalidArgumentError=class extends(_b4=AISDKError,_a4=symbol4,_b4){constructor({message,cause,argument}){super({name:name3,message,cause});this[_a4]=true;this.argument=argument;}static isInstance(error){return AISDKError.hasMarker(error,marker4);}};// src/errors/invalid-prompt-error.ts
var name6="AI_JSONParseError";var marker7=`vercel.ai.error.${name6}`;var symbol7=Symbol.for(marker7);var _a7,_b7;var JSONParseError=class extends(_b7=AISDKError,_a7=symbol7,_b7){constructor({text,cause}){super({name:name6,message:`JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`,cause});this[_a7]=true;this.text=text;}static isInstance(error){return AISDKError.hasMarker(error,marker7);}};// src/errors/load-api-key-error.ts
var name13="AI_TypeValidationError";var marker14=`vercel.ai.error.${name13}`;var symbol14=Symbol.for(marker14);var _a14,_b14;var TypeValidationError=class _TypeValidationError extends(_b14=AISDKError,_a14=symbol14,_b14){constructor({value,cause,context}){let contextPrefix="Type validation failed";if(context==null?void 0:context.field){contextPrefix+=` for ${context.field}`;}if((context==null?void 0:context.entityName)||(context==null?void 0:context.entityId)){contextPrefix+=" (";const parts=[];if(context.entityName){parts.push(context.entityName);}if(context.entityId){parts.push(`id: "${context.entityId}"`);}contextPrefix+=parts.join(", ");contextPrefix+=")";}super({name:name13,message:`${contextPrefix}: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`,cause});this[_a14]=true;this.value=value;this.context=context;}static isInstance(error){return AISDKError.hasMarker(error,marker14);}/**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value and context, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @param {TypeValidationContext} params.context - Optional context about what is being validated.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */static wrap({value,cause,context}){var _a16,_b16,_c;if(_TypeValidationError.isInstance(cause)&&cause.value===value&&((_a16=cause.context)==null?void 0:_a16.field)===(context==null?void 0:context.field)&&((_b16=cause.context)==null?void 0:_b16.entityName)===(context==null?void 0:context.entityName)&&((_c=cause.context)==null?void 0:_c.entityId)===(context==null?void 0:context.entityId)){return cause;}return new _TypeValidationError({value,cause,context});}};// src/errors/unsupported-functionality-error.ts
function isJSONValue(value){if(value===null||typeof value==="string"||typeof value==="number"||typeof value==="boolean"){return true;}if(Array.isArray(value)){return value.every(isJSONValue);}if(typeof value==="object"){return Object.entries(value).every(([key,val])=>typeof key==="string"&&(val===void 0||isJSONValue(val)));}return false;}function isJSONObject(value){return value!=null&&typeof value==="object"&&Object.entries(value).every(([key,val])=>typeof key==="string"&&(val===void 0||isJSONValue(val)));}

var _a$2;/** A special constant with type `never` */const NEVER=/*@__PURE__*/Object.freeze({status:"aborted"});function $constructor(name,initializer,params){function init(inst,def){if(!inst._zod){Object.defineProperty(inst,"_zod",{value:{def,constr:_,traits:new Set()},enumerable:false});}if(inst._zod.traits.has(name)){return;}inst._zod.traits.add(name);initializer(inst,def);// support prototype modifications
const proto=_.prototype;const keys=Object.keys(proto);for(let i=0;i<keys.length;i++){const k=keys[i];if(!(k in inst)){inst[k]=proto[k].bind(inst);}}}// doesn't work if Parent has a constructor with arguments
const Parent=params?.Parent??Object;class Definition extends Parent{}Object.defineProperty(Definition,"name",{value:name});function _(def){var _a;const inst=params?.Parent?new Definition():this;init(inst,def);(_a=inst._zod).deferred??(_a.deferred=[]);for(const fn of inst._zod.deferred){fn();}return inst;}Object.defineProperty(_,"init",{value:init});Object.defineProperty(_,Symbol.hasInstance,{value:inst=>{if(params?.Parent&&inst instanceof params.Parent)return true;return inst?._zod?.traits?.has(name);}});Object.defineProperty(_,"name",{value:name});return _;}//////////////////////////////   UTILITIES   ///////////////////////////////////////
class $ZodAsyncError extends Error{constructor(){super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);}}class $ZodEncodeError extends Error{constructor(name){super(`Encountered unidirectional transform during encode: ${name}`);this.name="ZodEncodeError";}}(_a$2=globalThis).__zod_globalConfig??(_a$2.__zod_globalConfig={});const globalConfig=globalThis.__zod_globalConfig;function config(newConfig){return globalConfig;}

function getEnumValues(entries){const numericValues=Object.values(entries).filter(v=>typeof v==="number");const values=Object.entries(entries).filter(([k,_])=>numericValues.indexOf(+k)===-1).map(([_,v])=>v);return values;}function jsonStringifyReplacer(_,value){if(typeof value==="bigint")return value.toString();return value;}function cached(getter){return {get value(){{const value=getter();Object.defineProperty(this,"value",{value});return value;}}};}function nullish(input){return input===null||input===undefined;}function cleanRegex(source){const start=source.startsWith("^")?1:0;const end=source.endsWith("$")?source.length-1:source.length;return source.slice(start,end);}function floatSafeRemainder(val,step){const ratio=val/step;const roundedRatio=Math.round(ratio);// Use a relative epsilon scaled to the magnitude of the result
const tolerance=Number.EPSILON*Math.max(Math.abs(ratio),1);if(Math.abs(ratio-roundedRatio)<tolerance)return 0;return ratio-roundedRatio;}const EVALUATING=/* @__PURE__*/Symbol("evaluating");function defineLazy(object,key,getter){let value=undefined;Object.defineProperty(object,key,{get(){if(value===EVALUATING){// Circular reference detected, return undefined to break the cycle
return undefined;}if(value===undefined){value=EVALUATING;value=getter();}return value;},set(v){Object.defineProperty(object,key,{value:v// configurable: true,
});// object[key] = v;
},configurable:true});}function assignProp(target,prop,value){Object.defineProperty(target,prop,{value,writable:true,enumerable:true,configurable:true});}function mergeDefs(...defs){const mergedDescriptors={};for(const def of defs){const descriptors=Object.getOwnPropertyDescriptors(def);Object.assign(mergedDescriptors,descriptors);}return Object.defineProperties({},mergedDescriptors);}function esc(str){return JSON.stringify(str);}function slugify(input){return input.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"");}const captureStackTrace="captureStackTrace"in Error?Error.captureStackTrace:(..._args)=>{};function isObject(data){return typeof data==="object"&&data!==null&&!Array.isArray(data);}const allowsEval=/* @__PURE__*/cached(()=>{// Skip the probe under `jitless`: strict CSPs report the caught `new Function`
// as a `securitypolicyviolation` even though the throw is swallowed.
if(globalConfig.jitless){return false;}// @ts-ignore
if(typeof navigator!=="undefined"&&navigator?.userAgent?.includes("Cloudflare")){return false;}try{const F=Function;new F("");return true;}catch(_){return false;}});function isPlainObject(o){if(isObject(o)===false)return false;// modified constructor
const ctor=o.constructor;if(ctor===undefined)return true;if(typeof ctor!=="function")return true;// modified prototype
const prot=ctor.prototype;if(isObject(prot)===false)return false;// ctor doesn't have static `isPrototypeOf`
if(Object.prototype.hasOwnProperty.call(prot,"isPrototypeOf")===false){return false;}return true;}function shallowClone(o){if(isPlainObject(o))return {...o};if(Array.isArray(o))return [...o];if(o instanceof Map)return new Map(o);if(o instanceof Set)return new Set(o);return o;}const propertyKeyTypes=/* @__PURE__*/new Set(["string","number","symbol"]);function escapeRegex(str){return str.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}// zod-specific utils
function clone(inst,def,params){const cl=new inst._zod.constr(def??inst._zod.def);if(!def||params?.parent)cl._zod.parent=inst;return cl;}function normalizeParams(_params){const params=_params;if(!params)return {};if(typeof params==="string")return {error:()=>params};if(params?.message!==undefined){if(params?.error!==undefined)throw new Error("Cannot specify both `message` and `error` params");params.error=params.message;}delete params.message;if(typeof params.error==="string")return {...params,error:()=>params.error};return params;}function optionalKeys(shape){return Object.keys(shape).filter(k=>{return shape[k]._zod.optin==="optional"&&shape[k]._zod.optout==="optional";});}const NUMBER_FORMAT_RANGES={safeint:[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,3.4028234663852886e38],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function pick(schema,mask){const currDef=schema._zod.def;const checks=currDef.checks;const hasChecks=checks&&checks.length>0;if(hasChecks){throw new Error(".pick() cannot be used on object schemas containing refinements");}const def=mergeDefs(schema._zod.def,{get shape(){const newShape={};for(const key in mask){if(!(key in currDef.shape)){throw new Error(`Unrecognized key: "${key}"`);}if(!mask[key])continue;newShape[key]=currDef.shape[key];}assignProp(this,"shape",newShape);// self-caching
return newShape;},checks:[]});return clone(schema,def);}function omit(schema,mask){const currDef=schema._zod.def;const checks=currDef.checks;const hasChecks=checks&&checks.length>0;if(hasChecks){throw new Error(".omit() cannot be used on object schemas containing refinements");}const def=mergeDefs(schema._zod.def,{get shape(){const newShape={...schema._zod.def.shape};for(const key in mask){if(!(key in currDef.shape)){throw new Error(`Unrecognized key: "${key}"`);}if(!mask[key])continue;delete newShape[key];}assignProp(this,"shape",newShape);// self-caching
return newShape;},checks:[]});return clone(schema,def);}function extend(schema,shape){if(!isPlainObject(shape)){throw new Error("Invalid input to extend: expected a plain object");}const checks=schema._zod.def.checks;const hasChecks=checks&&checks.length>0;if(hasChecks){// Only throw if new shape overlaps with existing shape
// Use getOwnPropertyDescriptor to check key existence without accessing values
const existingShape=schema._zod.def.shape;for(const key in shape){if(Object.getOwnPropertyDescriptor(existingShape,key)!==undefined){throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");}}}const def=mergeDefs(schema._zod.def,{get shape(){const _shape={...schema._zod.def.shape,...shape};assignProp(this,"shape",_shape);// self-caching
return _shape;}});return clone(schema,def);}function safeExtend(schema,shape){if(!isPlainObject(shape)){throw new Error("Invalid input to safeExtend: expected a plain object");}const def=mergeDefs(schema._zod.def,{get shape(){const _shape={...schema._zod.def.shape,...shape};assignProp(this,"shape",_shape);// self-caching
return _shape;}});return clone(schema,def);}function merge(a,b){if(a._zod.def.checks?.length){throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");}const def=mergeDefs(a._zod.def,{get shape(){const _shape={...a._zod.def.shape,...b._zod.def.shape};assignProp(this,"shape",_shape);// self-caching
return _shape;},get catchall(){return b._zod.def.catchall;},checks:b._zod.def.checks??[]});return clone(a,def);}function partial(Class,schema,mask){const currDef=schema._zod.def;const checks=currDef.checks;const hasChecks=checks&&checks.length>0;if(hasChecks){throw new Error(".partial() cannot be used on object schemas containing refinements");}const def=mergeDefs(schema._zod.def,{get shape(){const oldShape=schema._zod.def.shape;const shape={...oldShape};if(mask){for(const key in mask){if(!(key in oldShape)){throw new Error(`Unrecognized key: "${key}"`);}if(!mask[key])continue;// if (oldShape[key]!._zod.optin === "optional") continue;
shape[key]=Class?new Class({type:"optional",innerType:oldShape[key]}):oldShape[key];}}else {for(const key in oldShape){// if (oldShape[key]!._zod.optin === "optional") continue;
shape[key]=Class?new Class({type:"optional",innerType:oldShape[key]}):oldShape[key];}}assignProp(this,"shape",shape);// self-caching
return shape;},checks:[]});return clone(schema,def);}function required(Class,schema,mask){const def=mergeDefs(schema._zod.def,{get shape(){const oldShape=schema._zod.def.shape;const shape={...oldShape};if(mask){for(const key in mask){if(!(key in shape)){throw new Error(`Unrecognized key: "${key}"`);}if(!mask[key])continue;// overwrite with non-optional
shape[key]=new Class({type:"nonoptional",innerType:oldShape[key]});}}else {for(const key in oldShape){// overwrite with non-optional
shape[key]=new Class({type:"nonoptional",innerType:oldShape[key]});}}assignProp(this,"shape",shape);// self-caching
return shape;}});return clone(schema,def);}// invalid_type | too_big | too_small | invalid_format | not_multiple_of | unrecognized_keys | invalid_union | invalid_key | invalid_element | invalid_value | custom
function aborted(x,startIndex=0){if(x.aborted===true)return true;for(let i=startIndex;i<x.issues.length;i++){if(x.issues[i]?.continue!==true){return true;}}return false;}// Checks for explicit abort (continue === false), as opposed to implicit abort (continue === undefined).
// Used to respect `abort: true` in .refine() even for checks that have a `when` function.
function explicitlyAborted(x,startIndex=0){if(x.aborted===true)return true;for(let i=startIndex;i<x.issues.length;i++){if(x.issues[i]?.continue===false){return true;}}return false;}function prefixIssues(path,issues){return issues.map(iss=>{var _a;(_a=iss).path??(_a.path=[]);iss.path.unshift(path);return iss;});}function unwrapMessage(message){return typeof message==="string"?message:message?.message;}function finalizeIssue(iss,ctx,config){const message=iss.message?iss.message:unwrapMessage(iss.inst?._zod.def?.error?.(iss))??unwrapMessage(ctx?.error?.(iss))??unwrapMessage(config.customError?.(iss))??unwrapMessage(config.localeError?.(iss))??"Invalid input";const{inst:_inst,continue:_continue,input:_input,...rest}=iss;rest.path??(rest.path=[]);rest.message=message;if(ctx?.reportInput){rest.input=_input;}return rest;}function getLengthableOrigin(input){if(Array.isArray(input))return "array";if(typeof input==="string")return "string";return "unknown";}function issue(...args){const[iss,input,inst]=args;if(typeof iss==="string"){return {message:iss,code:"custom",input,inst};}return {...iss};}

const initializer$1=(inst,def)=>{inst.name="$ZodError";Object.defineProperty(inst,"_zod",{value:inst._zod,enumerable:false});Object.defineProperty(inst,"issues",{value:def,enumerable:false});inst.message=JSON.stringify(def,jsonStringifyReplacer,2);Object.defineProperty(inst,"toString",{value:()=>inst.message,enumerable:false});};const $ZodError=$constructor("$ZodError",initializer$1);const $ZodRealError=$constructor("$ZodError",initializer$1,{Parent:Error});function flattenError(error,mapper=issue=>issue.message){const fieldErrors={};const formErrors=[];for(const sub of error.issues){if(sub.path.length>0){fieldErrors[sub.path[0]]=fieldErrors[sub.path[0]]||[];fieldErrors[sub.path[0]].push(mapper(sub));}else {formErrors.push(mapper(sub));}}return {formErrors,fieldErrors};}function formatError(error,mapper=issue=>issue.message){const fieldErrors={_errors:[]};const processError=(error,path=[])=>{for(const issue of error.issues){if(issue.code==="invalid_union"&&issue.errors.length){issue.errors.map(issues=>processError({issues},[...path,...issue.path]));}else if(issue.code==="invalid_key"){processError({issues:issue.issues},[...path,...issue.path]);}else if(issue.code==="invalid_element"){processError({issues:issue.issues},[...path,...issue.path]);}else {const fullpath=[...path,...issue.path];if(fullpath.length===0){fieldErrors._errors.push(mapper(issue));}else {let curr=fieldErrors;let i=0;while(i<fullpath.length){const el=fullpath[i];const terminal=i===fullpath.length-1;if(!terminal){curr[el]=curr[el]||{_errors:[]};}else {curr[el]=curr[el]||{_errors:[]};curr[el]._errors.push(mapper(issue));}curr=curr[el];i++;}}}}};processError(error);return fieldErrors;}

const _parse$1=_Err=>(schema,value,_ctx,_params)=>{const ctx=_ctx?{..._ctx,async:false}:{async:false};const result=schema._zod.run({value,issues:[]},ctx);if(result instanceof Promise){throw new $ZodAsyncError();}if(result.issues.length){const e=new(_params?.Err??_Err)(result.issues.map(iss=>finalizeIssue(iss,ctx,config())));captureStackTrace(e,_params?.callee);throw e;}return result.value;};const _parseAsync=_Err=>async(schema,value,_ctx,params)=>{const ctx=_ctx?{..._ctx,async:true}:{async:true};let result=schema._zod.run({value,issues:[]},ctx);if(result instanceof Promise)result=await result;if(result.issues.length){const e=new(params?.Err??_Err)(result.issues.map(iss=>finalizeIssue(iss,ctx,config())));captureStackTrace(e,params?.callee);throw e;}return result.value;};const _safeParse=_Err=>(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,async:false}:{async:false};const result=schema._zod.run({value,issues:[]},ctx);if(result instanceof Promise){throw new $ZodAsyncError();}return result.issues.length?{success:false,error:new(_Err??$ZodError)(result.issues.map(iss=>finalizeIssue(iss,ctx,config())))}:{success:true,data:result.value};};const safeParse$1=/* @__PURE__*/_safeParse($ZodRealError);const _safeParseAsync=_Err=>async(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,async:true}:{async:true};let result=schema._zod.run({value,issues:[]},ctx);if(result instanceof Promise)result=await result;return result.issues.length?{success:false,error:new _Err(result.issues.map(iss=>finalizeIssue(iss,ctx,config())))}:{success:true,data:result.value};};const safeParseAsync$1=/* @__PURE__*/_safeParseAsync($ZodRealError);const _encode=_Err=>(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,direction:"backward"}:{direction:"backward"};return _parse$1(_Err)(schema,value,ctx);};const _decode=_Err=>(schema,value,_ctx)=>{return _parse$1(_Err)(schema,value,_ctx);};const _encodeAsync=_Err=>async(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,direction:"backward"}:{direction:"backward"};return _parseAsync(_Err)(schema,value,ctx);};const _decodeAsync=_Err=>async(schema,value,_ctx)=>{return _parseAsync(_Err)(schema,value,_ctx);};const _safeEncode=_Err=>(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,direction:"backward"}:{direction:"backward"};return _safeParse(_Err)(schema,value,ctx);};const _safeDecode=_Err=>(schema,value,_ctx)=>{return _safeParse(_Err)(schema,value,_ctx);};const _safeEncodeAsync=_Err=>async(schema,value,_ctx)=>{const ctx=_ctx?{..._ctx,direction:"backward"}:{direction:"backward"};return _safeParseAsync(_Err)(schema,value,ctx);};const _safeDecodeAsync=_Err=>async(schema,value,_ctx)=>{return _safeParseAsync(_Err)(schema,value,_ctx);};

/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */const cuid=/^[cC][0-9a-z]{6,}$/;const cuid2=/^[0-9a-z]+$/;const ulid=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;const xid=/^[0-9a-vA-V]{20}$/;const ksuid=/^[A-Za-z0-9]{27}$/;const nanoid=/^[a-zA-Z0-9_-]{21}$/;/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */const duration$1=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */const guid=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;/** Returns a regex for validating an RFC 9562/4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */const uuid=version=>{if(!version)return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);};/** Practical email validation */const email=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;const _emoji$1=`^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;function emoji(){return new RegExp(_emoji$1,"u");}const ipv4=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;const ipv6=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;const cidrv4=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;const cidrv6=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64$1=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;const base64url=/^[A-Za-z0-9_-]*$/;// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
const httpProtocol=/^https?$/;// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
// E.164: leading digit must be 1-9; total digits (excluding '+') between 7-15
const e164=/^\+[1-9]\d{6,14}$/;// const dateSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateSource=`(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;const date$1=/*@__PURE__*/new RegExp(`^${dateSource}$`);function timeSource(args){const hhmm=`(?:[01]\\d|2[0-3]):[0-5]\\d`;const regex=typeof args.precision==="number"?args.precision===-1?`${hhmm}`:args.precision===0?`${hhmm}:[0-5]\\d`:`${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`:`${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;return regex;}function time$1(args){return new RegExp(`^${timeSource(args)}$`);}// Adapted from https://stackoverflow.com/a/3143231
function datetime$1(args){const time=timeSource({precision:args.precision});const opts=["Z"];if(args.local)opts.push("");// if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
if(args.offset)opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);const timeRegex=`${time}(?:${opts.join("|")})`;return new RegExp(`^${dateSource}T(?:${timeRegex})$`);}const string$1=params=>{const regex=params?`[\\s\\S]{${params?.minimum??0},${params?.maximum??""}}`:`[\\s\\S]*`;return new RegExp(`^${regex}$`);};const integer=/^-?\d+$/;const number$1=/^-?\d+(?:\.\d+)?$/;const boolean$1=/^(?:true|false)$/i;const _null$2=/^null$/i;const lowercase=/^[^A-Z]*$/;// regex for string with no lowercase letters
const uppercase=/^[^a-z]*$/;// regex for hexadecimal strings (any length)

// import { $ZodType } from "./schemas.js";
const $ZodCheck=/*@__PURE__*/$constructor("$ZodCheck",(inst,def)=>{var _a;inst._zod??(inst._zod={});inst._zod.def=def;(_a=inst._zod).onattach??(_a.onattach=[]);});const numericOriginMap={number:"number",bigint:"bigint",object:"date"};const $ZodCheckLessThan=/*@__PURE__*/$constructor("$ZodCheckLessThan",(inst,def)=>{$ZodCheck.init(inst,def);const origin=numericOriginMap[typeof def.value];inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;const curr=(def.inclusive?bag.maximum:bag.exclusiveMaximum)??Number.POSITIVE_INFINITY;if(def.value<curr){if(def.inclusive)bag.maximum=def.value;else bag.exclusiveMaximum=def.value;}});inst._zod.check=payload=>{if(def.inclusive?payload.value<=def.value:payload.value<def.value){return;}payload.issues.push({origin,code:"too_big",maximum:typeof def.value==="object"?def.value.getTime():def.value,input:payload.value,inclusive:def.inclusive,inst,continue:!def.abort});};});const $ZodCheckGreaterThan=/*@__PURE__*/$constructor("$ZodCheckGreaterThan",(inst,def)=>{$ZodCheck.init(inst,def);const origin=numericOriginMap[typeof def.value];inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;const curr=(def.inclusive?bag.minimum:bag.exclusiveMinimum)??Number.NEGATIVE_INFINITY;if(def.value>curr){if(def.inclusive)bag.minimum=def.value;else bag.exclusiveMinimum=def.value;}});inst._zod.check=payload=>{if(def.inclusive?payload.value>=def.value:payload.value>def.value){return;}payload.issues.push({origin,code:"too_small",minimum:typeof def.value==="object"?def.value.getTime():def.value,input:payload.value,inclusive:def.inclusive,inst,continue:!def.abort});};});const $ZodCheckMultipleOf=/*@__PURE__*/$constructor("$ZodCheckMultipleOf",(inst,def)=>{$ZodCheck.init(inst,def);inst._zod.onattach.push(inst=>{var _a;(_a=inst._zod.bag).multipleOf??(_a.multipleOf=def.value);});inst._zod.check=payload=>{if(typeof payload.value!==typeof def.value)throw new Error("Cannot mix number and bigint in multiple_of check.");const isMultiple=typeof payload.value==="bigint"?payload.value%def.value===BigInt(0):floatSafeRemainder(payload.value,def.value)===0;if(isMultiple)return;payload.issues.push({origin:typeof payload.value,code:"not_multiple_of",divisor:def.value,input:payload.value,inst,continue:!def.abort});};});const $ZodCheckNumberFormat=/*@__PURE__*/$constructor("$ZodCheckNumberFormat",(inst,def)=>{$ZodCheck.init(inst,def);// no format checks
def.format=def.format||"float64";const isInt=def.format?.includes("int");const origin=isInt?"int":"number";const[minimum,maximum]=NUMBER_FORMAT_RANGES[def.format];inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.format=def.format;bag.minimum=minimum;bag.maximum=maximum;if(isInt)bag.pattern=integer;});inst._zod.check=payload=>{const input=payload.value;if(isInt){if(!Number.isInteger(input)){// invalid_format issue
// payload.issues.push({
//   expected: def.format,
//   format: def.format,
//   code: "invalid_format",
//   input,
//   inst,
// });
// invalid_type issue
payload.issues.push({expected:origin,format:def.format,code:"invalid_type",continue:false,input,inst});return;// not_multiple_of issue
// payload.issues.push({
//   code: "not_multiple_of",
//   origin: "number",
//   input,
//   inst,
//   divisor: 1,
// });
}if(!Number.isSafeInteger(input)){if(input>0){// too_big
payload.issues.push({input,code:"too_big",maximum:Number.MAX_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst,origin,inclusive:true,continue:!def.abort});}else {// too_small
payload.issues.push({input,code:"too_small",minimum:Number.MIN_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst,origin,inclusive:true,continue:!def.abort});}return;}}if(input<minimum){payload.issues.push({origin:"number",input,code:"too_small",minimum,inclusive:true,inst,continue:!def.abort});}if(input>maximum){payload.issues.push({origin:"number",input,code:"too_big",maximum,inclusive:true,inst,continue:!def.abort});}};});const $ZodCheckMaxLength=/*@__PURE__*/$constructor("$ZodCheckMaxLength",(inst,def)=>{var _a;$ZodCheck.init(inst,def);(_a=inst._zod.def).when??(_a.when=payload=>{const val=payload.value;return !nullish(val)&&val.length!==undefined;});inst._zod.onattach.push(inst=>{const curr=inst._zod.bag.maximum??Number.POSITIVE_INFINITY;if(def.maximum<curr)inst._zod.bag.maximum=def.maximum;});inst._zod.check=payload=>{const input=payload.value;const length=input.length;if(length<=def.maximum)return;const origin=getLengthableOrigin(input);payload.issues.push({origin,code:"too_big",maximum:def.maximum,inclusive:true,input,inst,continue:!def.abort});};});const $ZodCheckMinLength=/*@__PURE__*/$constructor("$ZodCheckMinLength",(inst,def)=>{var _a;$ZodCheck.init(inst,def);(_a=inst._zod.def).when??(_a.when=payload=>{const val=payload.value;return !nullish(val)&&val.length!==undefined;});inst._zod.onattach.push(inst=>{const curr=inst._zod.bag.minimum??Number.NEGATIVE_INFINITY;if(def.minimum>curr)inst._zod.bag.minimum=def.minimum;});inst._zod.check=payload=>{const input=payload.value;const length=input.length;if(length>=def.minimum)return;const origin=getLengthableOrigin(input);payload.issues.push({origin,code:"too_small",minimum:def.minimum,inclusive:true,input,inst,continue:!def.abort});};});const $ZodCheckLengthEquals=/*@__PURE__*/$constructor("$ZodCheckLengthEquals",(inst,def)=>{var _a;$ZodCheck.init(inst,def);(_a=inst._zod.def).when??(_a.when=payload=>{const val=payload.value;return !nullish(val)&&val.length!==undefined;});inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.minimum=def.length;bag.maximum=def.length;bag.length=def.length;});inst._zod.check=payload=>{const input=payload.value;const length=input.length;if(length===def.length)return;const origin=getLengthableOrigin(input);const tooBig=length>def.length;payload.issues.push({origin,...(tooBig?{code:"too_big",maximum:def.length}:{code:"too_small",minimum:def.length}),inclusive:true,exact:true,input:payload.value,inst,continue:!def.abort});};});const $ZodCheckStringFormat=/*@__PURE__*/$constructor("$ZodCheckStringFormat",(inst,def)=>{var _a,_b;$ZodCheck.init(inst,def);inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.format=def.format;if(def.pattern){bag.patterns??(bag.patterns=new Set());bag.patterns.add(def.pattern);}});if(def.pattern)(_a=inst._zod).check??(_a.check=payload=>{def.pattern.lastIndex=0;if(def.pattern.test(payload.value))return;payload.issues.push({origin:"string",code:"invalid_format",format:def.format,input:payload.value,...(def.pattern?{pattern:def.pattern.toString()}:{}),inst,continue:!def.abort});});else (_b=inst._zod).check??(_b.check=()=>{});});const $ZodCheckRegex=/*@__PURE__*/$constructor("$ZodCheckRegex",(inst,def)=>{$ZodCheckStringFormat.init(inst,def);inst._zod.check=payload=>{def.pattern.lastIndex=0;if(def.pattern.test(payload.value))return;payload.issues.push({origin:"string",code:"invalid_format",format:"regex",input:payload.value,pattern:def.pattern.toString(),inst,continue:!def.abort});};});const $ZodCheckLowerCase=/*@__PURE__*/$constructor("$ZodCheckLowerCase",(inst,def)=>{def.pattern??(def.pattern=lowercase);$ZodCheckStringFormat.init(inst,def);});const $ZodCheckUpperCase=/*@__PURE__*/$constructor("$ZodCheckUpperCase",(inst,def)=>{def.pattern??(def.pattern=uppercase);$ZodCheckStringFormat.init(inst,def);});const $ZodCheckIncludes=/*@__PURE__*/$constructor("$ZodCheckIncludes",(inst,def)=>{$ZodCheck.init(inst,def);const escapedRegex=escapeRegex(def.includes);const pattern=new RegExp(typeof def.position==="number"?`^.{${def.position}}${escapedRegex}`:escapedRegex);def.pattern=pattern;inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.patterns??(bag.patterns=new Set());bag.patterns.add(pattern);});inst._zod.check=payload=>{if(payload.value.includes(def.includes,def.position))return;payload.issues.push({origin:"string",code:"invalid_format",format:"includes",includes:def.includes,input:payload.value,inst,continue:!def.abort});};});const $ZodCheckStartsWith=/*@__PURE__*/$constructor("$ZodCheckStartsWith",(inst,def)=>{$ZodCheck.init(inst,def);const pattern=new RegExp(`^${escapeRegex(def.prefix)}.*`);def.pattern??(def.pattern=pattern);inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.patterns??(bag.patterns=new Set());bag.patterns.add(pattern);});inst._zod.check=payload=>{if(payload.value.startsWith(def.prefix))return;payload.issues.push({origin:"string",code:"invalid_format",format:"starts_with",prefix:def.prefix,input:payload.value,inst,continue:!def.abort});};});const $ZodCheckEndsWith=/*@__PURE__*/$constructor("$ZodCheckEndsWith",(inst,def)=>{$ZodCheck.init(inst,def);const pattern=new RegExp(`.*${escapeRegex(def.suffix)}$`);def.pattern??(def.pattern=pattern);inst._zod.onattach.push(inst=>{const bag=inst._zod.bag;bag.patterns??(bag.patterns=new Set());bag.patterns.add(pattern);});inst._zod.check=payload=>{if(payload.value.endsWith(def.suffix))return;payload.issues.push({origin:"string",code:"invalid_format",format:"ends_with",suffix:def.suffix,input:payload.value,inst,continue:!def.abort});};});///////////////////////////////////
const $ZodCheckOverwrite=/*@__PURE__*/$constructor("$ZodCheckOverwrite",(inst,def)=>{$ZodCheck.init(inst,def);inst._zod.check=payload=>{payload.value=def.tx(payload.value);};});

class Doc{constructor(args=[]){this.content=[];this.indent=0;if(this)this.args=args;}indented(fn){this.indent+=1;fn(this);this.indent-=1;}write(arg){if(typeof arg==="function"){arg(this,{execution:"sync"});arg(this,{execution:"async"});return;}const content=arg;const lines=content.split("\n").filter(x=>x);const minIndent=Math.min(...lines.map(x=>x.length-x.trimStart().length));const dedented=lines.map(x=>x.slice(minIndent)).map(x=>" ".repeat(this.indent*2)+x);for(const line of dedented){this.content.push(line);}}compile(){const F=Function;const args=this?.args;const content=this?.content??[``];const lines=[...content.map(x=>`  ${x}`)];// console.log(lines.join("\n"));
return new F(...args,lines.join("\n"));}}

const version={major:4,minor:4,patch:3};

const $ZodType=/*@__PURE__*/$constructor("$ZodType",(inst,def)=>{var _a;inst??(inst={});inst._zod.def=def;// set _def property
inst._zod.bag=inst._zod.bag||{};// initialize _bag object
inst._zod.version=version;const checks=[...(inst._zod.def.checks??[])];// if inst is itself a checks.$ZodCheck, run it as a check
if(inst._zod.traits.has("$ZodCheck")){checks.unshift(inst);}for(const ch of checks){for(const fn of ch._zod.onattach){fn(inst);}}if(checks.length===0){// deferred initializer
// inst._zod.parse is not yet defined
(_a=inst._zod).deferred??(_a.deferred=[]);inst._zod.deferred?.push(()=>{inst._zod.run=inst._zod.parse;});}else {const runChecks=(payload,checks,ctx)=>{let isAborted=aborted(payload);let asyncResult;for(const ch of checks){if(ch._zod.def.when){if(explicitlyAborted(payload))continue;const shouldRun=ch._zod.def.when(payload);if(!shouldRun)continue;}else if(isAborted){continue;}const currLen=payload.issues.length;const _=ch._zod.check(payload);if(_ instanceof Promise&&ctx?.async===false){throw new $ZodAsyncError();}if(asyncResult||_ instanceof Promise){asyncResult=(asyncResult??Promise.resolve()).then(async()=>{await _;const nextLen=payload.issues.length;if(nextLen===currLen)return;if(!isAborted)isAborted=aborted(payload,currLen);});}else {const nextLen=payload.issues.length;if(nextLen===currLen)continue;if(!isAborted)isAborted=aborted(payload,currLen);}}if(asyncResult){return asyncResult.then(()=>{return payload;});}return payload;};const handleCanaryResult=(canary,payload,ctx)=>{// abort if the canary is aborted
if(aborted(canary)){canary.aborted=true;return canary;}// run checks first, then
const checkResult=runChecks(payload,checks,ctx);if(checkResult instanceof Promise){if(ctx.async===false)throw new $ZodAsyncError();return checkResult.then(checkResult=>inst._zod.parse(checkResult,ctx));}return inst._zod.parse(checkResult,ctx);};inst._zod.run=(payload,ctx)=>{if(ctx.skipChecks){return inst._zod.parse(payload,ctx);}if(ctx.direction==="backward"){// run canary
// initial pass (no checks)
const canary=inst._zod.parse({value:payload.value,issues:[]},{...ctx,skipChecks:true});if(canary instanceof Promise){return canary.then(canary=>{return handleCanaryResult(canary,payload,ctx);});}return handleCanaryResult(canary,payload,ctx);}// forward
const result=inst._zod.parse(payload,ctx);if(result instanceof Promise){if(ctx.async===false)throw new $ZodAsyncError();return result.then(result=>runChecks(result,checks,ctx));}return runChecks(result,checks,ctx);};}// Lazy initialize ~standard to avoid creating objects for every schema
defineLazy(inst,"~standard",()=>({validate:value=>{try{const r=safeParse$1(inst,value);return r.success?{value:r.data}:{issues:r.error?.issues};}catch(_){return safeParseAsync$1(inst,value).then(r=>r.success?{value:r.data}:{issues:r.error?.issues});}},vendor:"zod",version:1}));});const $ZodString=/*@__PURE__*/$constructor("$ZodString",(inst,def)=>{$ZodType.init(inst,def);inst._zod.pattern=[...(inst?._zod.bag?.patterns??[])].pop()??string$1(inst._zod.bag);inst._zod.parse=(payload,_)=>{if(def.coerce)try{payload.value=String(payload.value);}catch(_){}if(typeof payload.value==="string")return payload;payload.issues.push({expected:"string",code:"invalid_type",input:payload.value,inst});return payload;};});const $ZodStringFormat=/*@__PURE__*/$constructor("$ZodStringFormat",(inst,def)=>{// check initialization must come first
$ZodCheckStringFormat.init(inst,def);$ZodString.init(inst,def);});const $ZodGUID=/*@__PURE__*/$constructor("$ZodGUID",(inst,def)=>{def.pattern??(def.pattern=guid);$ZodStringFormat.init(inst,def);});const $ZodUUID=/*@__PURE__*/$constructor("$ZodUUID",(inst,def)=>{if(def.version){const versionMap={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8};const v=versionMap[def.version];if(v===undefined)throw new Error(`Invalid UUID version: "${def.version}"`);def.pattern??(def.pattern=uuid(v));}else def.pattern??(def.pattern=uuid());$ZodStringFormat.init(inst,def);});const $ZodEmail=/*@__PURE__*/$constructor("$ZodEmail",(inst,def)=>{def.pattern??(def.pattern=email);$ZodStringFormat.init(inst,def);});const $ZodURL=/*@__PURE__*/$constructor("$ZodURL",(inst,def)=>{$ZodStringFormat.init(inst,def);inst._zod.check=payload=>{try{// Trim whitespace from input
const trimmed=payload.value.trim();// When normalize is off, require :// for http/https URLs
// This prevents strings like "http:example.com" or "https:/path" from being silently accepted
if(!def.normalize&&def.protocol?.source===httpProtocol.source){if(!/^https?:\/\//i.test(trimmed)){payload.issues.push({code:"invalid_format",format:"url",note:"Invalid URL format",input:payload.value,inst,continue:!def.abort});return;}}// @ts-ignore
const url=new URL(trimmed);if(def.hostname){def.hostname.lastIndex=0;if(!def.hostname.test(url.hostname)){payload.issues.push({code:"invalid_format",format:"url",note:"Invalid hostname",pattern:def.hostname.source,input:payload.value,inst,continue:!def.abort});}}if(def.protocol){def.protocol.lastIndex=0;if(!def.protocol.test(url.protocol.endsWith(":")?url.protocol.slice(0,-1):url.protocol)){payload.issues.push({code:"invalid_format",format:"url",note:"Invalid protocol",pattern:def.protocol.source,input:payload.value,inst,continue:!def.abort});}}// Set the output value based on normalize flag
if(def.normalize){// Use normalized URL
payload.value=url.href;}else {// Preserve the original input (trimmed)
payload.value=trimmed;}return;}catch(_){payload.issues.push({code:"invalid_format",format:"url",input:payload.value,inst,continue:!def.abort});}};});const $ZodEmoji=/*@__PURE__*/$constructor("$ZodEmoji",(inst,def)=>{def.pattern??(def.pattern=emoji());$ZodStringFormat.init(inst,def);});const $ZodNanoID=/*@__PURE__*/$constructor("$ZodNanoID",(inst,def)=>{def.pattern??(def.pattern=nanoid);$ZodStringFormat.init(inst,def);});/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */const $ZodCUID=/*@__PURE__*/$constructor("$ZodCUID",(inst,def)=>{def.pattern??(def.pattern=cuid);$ZodStringFormat.init(inst,def);});const $ZodCUID2=/*@__PURE__*/$constructor("$ZodCUID2",(inst,def)=>{def.pattern??(def.pattern=cuid2);$ZodStringFormat.init(inst,def);});const $ZodULID=/*@__PURE__*/$constructor("$ZodULID",(inst,def)=>{def.pattern??(def.pattern=ulid);$ZodStringFormat.init(inst,def);});const $ZodXID=/*@__PURE__*/$constructor("$ZodXID",(inst,def)=>{def.pattern??(def.pattern=xid);$ZodStringFormat.init(inst,def);});const $ZodKSUID=/*@__PURE__*/$constructor("$ZodKSUID",(inst,def)=>{def.pattern??(def.pattern=ksuid);$ZodStringFormat.init(inst,def);});const $ZodISODateTime=/*@__PURE__*/$constructor("$ZodISODateTime",(inst,def)=>{def.pattern??(def.pattern=datetime$1(def));$ZodStringFormat.init(inst,def);});const $ZodISODate=/*@__PURE__*/$constructor("$ZodISODate",(inst,def)=>{def.pattern??(def.pattern=date$1);$ZodStringFormat.init(inst,def);});const $ZodISOTime=/*@__PURE__*/$constructor("$ZodISOTime",(inst,def)=>{def.pattern??(def.pattern=time$1(def));$ZodStringFormat.init(inst,def);});const $ZodISODuration=/*@__PURE__*/$constructor("$ZodISODuration",(inst,def)=>{def.pattern??(def.pattern=duration$1);$ZodStringFormat.init(inst,def);});const $ZodIPv4=/*@__PURE__*/$constructor("$ZodIPv4",(inst,def)=>{def.pattern??(def.pattern=ipv4);$ZodStringFormat.init(inst,def);inst._zod.bag.format=`ipv4`;});const $ZodIPv6=/*@__PURE__*/$constructor("$ZodIPv6",(inst,def)=>{def.pattern??(def.pattern=ipv6);$ZodStringFormat.init(inst,def);inst._zod.bag.format=`ipv6`;inst._zod.check=payload=>{try{// @ts-ignore
new URL(`http://[${payload.value}]`);// return;
}catch{payload.issues.push({code:"invalid_format",format:"ipv6",input:payload.value,inst,continue:!def.abort});}};});const $ZodCIDRv4=/*@__PURE__*/$constructor("$ZodCIDRv4",(inst,def)=>{def.pattern??(def.pattern=cidrv4);$ZodStringFormat.init(inst,def);});const $ZodCIDRv6=/*@__PURE__*/$constructor("$ZodCIDRv6",(inst,def)=>{def.pattern??(def.pattern=cidrv6);// not used for validation
$ZodStringFormat.init(inst,def);inst._zod.check=payload=>{const parts=payload.value.split("/");try{if(parts.length!==2)throw new Error();const[address,prefix]=parts;if(!prefix)throw new Error();const prefixNum=Number(prefix);if(`${prefixNum}`!==prefix)throw new Error();if(prefixNum<0||prefixNum>128)throw new Error();// @ts-ignore
new URL(`http://[${address}]`);}catch{payload.issues.push({code:"invalid_format",format:"cidrv6",input:payload.value,inst,continue:!def.abort});}};});//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64(data){if(data==="")return true;// atob ignores whitespace, so reject it up front.
if(/\s/.test(data))return false;if(data.length%4!==0)return false;try{// @ts-ignore
atob(data);return true;}catch{return false;}}const $ZodBase64=/*@__PURE__*/$constructor("$ZodBase64",(inst,def)=>{def.pattern??(def.pattern=base64$1);$ZodStringFormat.init(inst,def);inst._zod.bag.contentEncoding="base64";inst._zod.check=payload=>{if(isValidBase64(payload.value))return;payload.issues.push({code:"invalid_format",format:"base64",input:payload.value,inst,continue:!def.abort});};});//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64URL(data){if(!base64url.test(data))return false;const base64=data.replace(/[-_]/g,c=>c==="-"?"+":"/");const padded=base64.padEnd(Math.ceil(base64.length/4)*4,"=");return isValidBase64(padded);}const $ZodBase64URL=/*@__PURE__*/$constructor("$ZodBase64URL",(inst,def)=>{def.pattern??(def.pattern=base64url);$ZodStringFormat.init(inst,def);inst._zod.bag.contentEncoding="base64url";inst._zod.check=payload=>{if(isValidBase64URL(payload.value))return;payload.issues.push({code:"invalid_format",format:"base64url",input:payload.value,inst,continue:!def.abort});};});const $ZodE164=/*@__PURE__*/$constructor("$ZodE164",(inst,def)=>{def.pattern??(def.pattern=e164);$ZodStringFormat.init(inst,def);});//////////////////////////////   ZodJWT   //////////////////////////////
function isValidJWT(token,algorithm=null){try{const tokensParts=token.split(".");if(tokensParts.length!==3)return false;const[header]=tokensParts;if(!header)return false;// @ts-ignore
const parsedHeader=JSON.parse(atob(header));if("typ"in parsedHeader&&parsedHeader?.typ!=="JWT")return false;if(!parsedHeader.alg)return false;if(algorithm&&(!("alg"in parsedHeader)||parsedHeader.alg!==algorithm))return false;return true;}catch{return false;}}const $ZodJWT=/*@__PURE__*/$constructor("$ZodJWT",(inst,def)=>{$ZodStringFormat.init(inst,def);inst._zod.check=payload=>{if(isValidJWT(payload.value,def.alg))return;payload.issues.push({code:"invalid_format",format:"jwt",input:payload.value,inst,continue:!def.abort});};});const $ZodNumber=/*@__PURE__*/$constructor("$ZodNumber",(inst,def)=>{$ZodType.init(inst,def);inst._zod.pattern=inst._zod.bag.pattern??number$1;inst._zod.parse=(payload,_ctx)=>{if(def.coerce)try{payload.value=Number(payload.value);}catch(_){}const input=payload.value;if(typeof input==="number"&&!Number.isNaN(input)&&Number.isFinite(input)){return payload;}const received=typeof input==="number"?Number.isNaN(input)?"NaN":!Number.isFinite(input)?"Infinity":undefined:undefined;payload.issues.push({expected:"number",code:"invalid_type",input,inst,...(received?{received}:{})});return payload;};});const $ZodNumberFormat=/*@__PURE__*/$constructor("$ZodNumberFormat",(inst,def)=>{$ZodCheckNumberFormat.init(inst,def);$ZodNumber.init(inst,def);// no format checks
});const $ZodBoolean=/*@__PURE__*/$constructor("$ZodBoolean",(inst,def)=>{$ZodType.init(inst,def);inst._zod.pattern=boolean$1;inst._zod.parse=(payload,_ctx)=>{if(def.coerce)try{payload.value=Boolean(payload.value);}catch(_){}const input=payload.value;if(typeof input==="boolean")return payload;payload.issues.push({expected:"boolean",code:"invalid_type",input,inst});return payload;};});const $ZodNull=/*@__PURE__*/$constructor("$ZodNull",(inst,def)=>{$ZodType.init(inst,def);inst._zod.pattern=_null$2;inst._zod.values=new Set([null]);inst._zod.parse=(payload,_ctx)=>{const input=payload.value;if(input===null)return payload;payload.issues.push({expected:"null",code:"invalid_type",input,inst});return payload;};});const $ZodAny=/*@__PURE__*/$constructor("$ZodAny",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=payload=>payload;});const $ZodUnknown=/*@__PURE__*/$constructor("$ZodUnknown",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=payload=>payload;});const $ZodNever=/*@__PURE__*/$constructor("$ZodNever",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=(payload,_ctx)=>{payload.issues.push({expected:"never",code:"invalid_type",input:payload.value,inst});return payload;};});function handleArrayResult(result,final,index){if(result.issues.length){final.issues.push(...prefixIssues(index,result.issues));}final.value[index]=result.value;}const $ZodArray=/*@__PURE__*/$constructor("$ZodArray",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=(payload,ctx)=>{const input=payload.value;if(!Array.isArray(input)){payload.issues.push({expected:"array",code:"invalid_type",input,inst});return payload;}payload.value=Array(input.length);const proms=[];for(let i=0;i<input.length;i++){const item=input[i];const result=def.element._zod.run({value:item,issues:[]},ctx);if(result instanceof Promise){proms.push(result.then(result=>handleArrayResult(result,payload,i)));}else {handleArrayResult(result,payload,i);}}if(proms.length){return Promise.all(proms).then(()=>payload);}return payload;//handleArrayResultsAsync(parseResults, final);
};});function handlePropertyResult(result,final,key,input,isOptionalIn,isOptionalOut){const isPresent=key in input;if(result.issues.length){// For optional-in/out schemas, ignore errors on absent keys.
if(isOptionalIn&&isOptionalOut&&!isPresent){return;}final.issues.push(...prefixIssues(key,result.issues));}if(!isPresent&&!isOptionalIn){if(!result.issues.length){final.issues.push({code:"invalid_type",expected:"nonoptional",input:undefined,path:[key]});}return;}if(result.value===undefined){if(isPresent){final.value[key]=undefined;}}else {final.value[key]=result.value;}}function normalizeDef(def){const keys=Object.keys(def.shape);for(const k of keys){if(!def.shape?.[k]?._zod?.traits?.has("$ZodType")){throw new Error(`Invalid element at key "${k}": expected a Zod schema`);}}const okeys=optionalKeys(def.shape);return {...def,keys,keySet:new Set(keys),numKeys:keys.length,optionalKeys:new Set(okeys)};}function handleCatchall(proms,input,payload,ctx,def,inst){const unrecognized=[];const keySet=def.keySet;const _catchall=def.catchall._zod;const t=_catchall.def.type;const isOptionalIn=_catchall.optin==="optional";const isOptionalOut=_catchall.optout==="optional";for(const key in input){// skip __proto__ so it can't replace the result prototype via the
// assignment setter on the plain {} we build into
if(key==="__proto__")continue;if(keySet.has(key))continue;if(t==="never"){unrecognized.push(key);continue;}const r=_catchall.run({value:input[key],issues:[]},ctx);if(r instanceof Promise){proms.push(r.then(r=>handlePropertyResult(r,payload,key,input,isOptionalIn,isOptionalOut)));}else {handlePropertyResult(r,payload,key,input,isOptionalIn,isOptionalOut);}}if(unrecognized.length){payload.issues.push({code:"unrecognized_keys",keys:unrecognized,input,inst});}if(!proms.length)return payload;return Promise.all(proms).then(()=>{return payload;});}const $ZodObject=/*@__PURE__*/$constructor("$ZodObject",(inst,def)=>{// requires cast because technically $ZodObject doesn't extend
$ZodType.init(inst,def);// const sh = def.shape;
const desc=Object.getOwnPropertyDescriptor(def,"shape");if(!desc?.get){const sh=def.shape;Object.defineProperty(def,"shape",{get:()=>{const newSh={...sh};Object.defineProperty(def,"shape",{value:newSh});return newSh;}});}const _normalized=cached(()=>normalizeDef(def));defineLazy(inst._zod,"propValues",()=>{const shape=def.shape;const propValues={};for(const key in shape){const field=shape[key]._zod;if(field.values){propValues[key]??(propValues[key]=new Set());for(const v of field.values)propValues[key].add(v);}}return propValues;});const isObject$1=isObject;const catchall=def.catchall;let value;inst._zod.parse=(payload,ctx)=>{value??(value=_normalized.value);const input=payload.value;if(!isObject$1(input)){payload.issues.push({expected:"object",code:"invalid_type",input,inst});return payload;}payload.value={};const proms=[];const shape=value.shape;for(const key of value.keys){const el=shape[key];const isOptionalIn=el._zod.optin==="optional";const isOptionalOut=el._zod.optout==="optional";const r=el._zod.run({value:input[key],issues:[]},ctx);if(r instanceof Promise){proms.push(r.then(r=>handlePropertyResult(r,payload,key,input,isOptionalIn,isOptionalOut)));}else {handlePropertyResult(r,payload,key,input,isOptionalIn,isOptionalOut);}}if(!catchall){return proms.length?Promise.all(proms).then(()=>payload):payload;}return handleCatchall(proms,input,payload,ctx,_normalized.value,inst);};});const $ZodObjectJIT=/*@__PURE__*/$constructor("$ZodObjectJIT",(inst,def)=>{// requires cast because technically $ZodObject doesn't extend
$ZodObject.init(inst,def);const superParse=inst._zod.parse;const _normalized=cached(()=>normalizeDef(def));const generateFastpass=shape=>{const doc=new Doc(["shape","payload","ctx"]);const normalized=_normalized.value;const parseStr=key=>{const k=esc(key);return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;};doc.write(`const input = payload.value;`);const ids=Object.create(null);let counter=0;for(const key of normalized.keys){ids[key]=`key_${counter++}`;}// A: preserve key order {
doc.write(`const newResult = {};`);for(const key of normalized.keys){const id=ids[key];const k=esc(key);const schema=shape[key];const isOptionalIn=schema?._zod?.optin==="optional";const isOptionalOut=schema?._zod?.optout==="optional";doc.write(`const ${id} = ${parseStr(key)};`);if(isOptionalIn&&isOptionalOut){// For optional-in/out schemas, ignore errors on absent keys
doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);}else if(!isOptionalIn){doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);}else {doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);}}doc.write(`payload.value = newResult;`);doc.write(`return payload;`);const fn=doc.compile();return (payload,ctx)=>fn(shape,payload,ctx);};let fastpass;const isObject$1=isObject;const jit=!globalConfig.jitless;const allowsEval$1=allowsEval;const fastEnabled=jit&&allowsEval$1.value;// && !def.catchall;
const catchall=def.catchall;let value;inst._zod.parse=(payload,ctx)=>{value??(value=_normalized.value);const input=payload.value;if(!isObject$1(input)){payload.issues.push({expected:"object",code:"invalid_type",input,inst});return payload;}if(jit&&fastEnabled&&ctx?.async===false&&ctx.jitless!==true){// always synchronous
if(!fastpass)fastpass=generateFastpass(def.shape);payload=fastpass(payload,ctx);if(!catchall)return payload;return handleCatchall([],input,payload,ctx,value,inst);}return superParse(payload,ctx);};});function handleUnionResults(results,final,inst,ctx){for(const result of results){if(result.issues.length===0){final.value=result.value;return final;}}const nonaborted=results.filter(r=>!aborted(r));if(nonaborted.length===1){final.value=nonaborted[0].value;return nonaborted[0];}final.issues.push({code:"invalid_union",input:final.value,inst,errors:results.map(result=>result.issues.map(iss=>finalizeIssue(iss,ctx,config())))});return final;}const $ZodUnion=/*@__PURE__*/$constructor("$ZodUnion",(inst,def)=>{$ZodType.init(inst,def);defineLazy(inst._zod,"optin",()=>def.options.some(o=>o._zod.optin==="optional")?"optional":undefined);defineLazy(inst._zod,"optout",()=>def.options.some(o=>o._zod.optout==="optional")?"optional":undefined);defineLazy(inst._zod,"values",()=>{if(def.options.every(o=>o._zod.values)){return new Set(def.options.flatMap(option=>Array.from(option._zod.values)));}return undefined;});defineLazy(inst._zod,"pattern",()=>{if(def.options.every(o=>o._zod.pattern)){const patterns=def.options.map(o=>o._zod.pattern);return new RegExp(`^(${patterns.map(p=>cleanRegex(p.source)).join("|")})$`);}return undefined;});const first=def.options.length===1?def.options[0]._zod.run:null;inst._zod.parse=(payload,ctx)=>{if(first){return first(payload,ctx);}let async=false;const results=[];for(const option of def.options){const result=option._zod.run({value:payload.value,issues:[]},ctx);if(result instanceof Promise){results.push(result);async=true;}else {if(result.issues.length===0)return result;results.push(result);}}if(!async)return handleUnionResults(results,payload,inst,ctx);return Promise.all(results).then(results=>{return handleUnionResults(results,payload,inst,ctx);});};});const $ZodDiscriminatedUnion=/*@__PURE__*/$constructor("$ZodDiscriminatedUnion",(inst,def)=>{def.inclusive=false;$ZodUnion.init(inst,def);const _super=inst._zod.parse;defineLazy(inst._zod,"propValues",()=>{const propValues={};for(const option of def.options){const pv=option._zod.propValues;if(!pv||Object.keys(pv).length===0)throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);for(const[k,v]of Object.entries(pv)){if(!propValues[k])propValues[k]=new Set();for(const val of v){propValues[k].add(val);}}}return propValues;});const disc=cached(()=>{const opts=def.options;const map=new Map();for(const o of opts){const values=o._zod.propValues?.[def.discriminator];if(!values||values.size===0)throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);for(const v of values){if(map.has(v)){throw new Error(`Duplicate discriminator value "${String(v)}"`);}map.set(v,o);}}return map;});inst._zod.parse=(payload,ctx)=>{const input=payload.value;if(!isObject(input)){payload.issues.push({code:"invalid_type",expected:"object",input,inst});return payload;}const opt=disc.value.get(input?.[def.discriminator]);if(opt){return opt._zod.run(payload,ctx);}// Fall back to union matching when the fast discriminator path fails:
// - explicitly enabled via unionFallback, or
// - during backward direction (encode), since codec-based discriminators
//   have different values in forward vs backward directions
if(def.unionFallback||ctx.direction==="backward"){return _super(payload,ctx);}// no matching discriminator
payload.issues.push({code:"invalid_union",errors:[],note:"No matching discriminator",discriminator:def.discriminator,options:Array.from(disc.value.keys()),input,path:[def.discriminator],inst});return payload;};});const $ZodIntersection=/*@__PURE__*/$constructor("$ZodIntersection",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=(payload,ctx)=>{const input=payload.value;const left=def.left._zod.run({value:input,issues:[]},ctx);const right=def.right._zod.run({value:input,issues:[]},ctx);const async=left instanceof Promise||right instanceof Promise;if(async){return Promise.all([left,right]).then(([left,right])=>{return handleIntersectionResults(payload,left,right);});}return handleIntersectionResults(payload,left,right);};});function mergeValues(a,b){// const aType = parse.t(a);
// const bType = parse.t(b);
if(a===b){return {valid:true,data:a};}if(a instanceof Date&&b instanceof Date&&+a===+b){return {valid:true,data:a};}if(isPlainObject(a)&&isPlainObject(b)){const bKeys=Object.keys(b);const sharedKeys=Object.keys(a).filter(key=>bKeys.indexOf(key)!==-1);const newObj={...a,...b};for(const key of sharedKeys){const sharedValue=mergeValues(a[key],b[key]);if(!sharedValue.valid){return {valid:false,mergeErrorPath:[key,...sharedValue.mergeErrorPath]};}newObj[key]=sharedValue.data;}return {valid:true,data:newObj};}if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length){return {valid:false,mergeErrorPath:[]};}const newArray=[];for(let index=0;index<a.length;index++){const itemA=a[index];const itemB=b[index];const sharedValue=mergeValues(itemA,itemB);if(!sharedValue.valid){return {valid:false,mergeErrorPath:[index,...sharedValue.mergeErrorPath]};}newArray.push(sharedValue.data);}return {valid:true,data:newArray};}return {valid:false,mergeErrorPath:[]};}function handleIntersectionResults(result,left,right){// Track which side(s) report each key as unrecognized
const unrecKeys=new Map();let unrecIssue;for(const iss of left.issues){if(iss.code==="unrecognized_keys"){unrecIssue??(unrecIssue=iss);for(const k of iss.keys){if(!unrecKeys.has(k))unrecKeys.set(k,{});unrecKeys.get(k).l=true;}}else {result.issues.push(iss);}}for(const iss of right.issues){if(iss.code==="unrecognized_keys"){for(const k of iss.keys){if(!unrecKeys.has(k))unrecKeys.set(k,{});unrecKeys.get(k).r=true;}}else {result.issues.push(iss);}}// Report only keys unrecognized by BOTH sides
const bothKeys=[...unrecKeys].filter(([,f])=>f.l&&f.r).map(([k])=>k);if(bothKeys.length&&unrecIssue){result.issues.push({...unrecIssue,keys:bothKeys});}if(aborted(result))return result;const merged=mergeValues(left.value,right.value);if(!merged.valid){throw new Error(`Unmergable intersection. Error path: `+`${JSON.stringify(merged.mergeErrorPath)}`);}result.value=merged.data;return result;}const $ZodRecord=/*@__PURE__*/$constructor("$ZodRecord",(inst,def)=>{$ZodType.init(inst,def);inst._zod.parse=(payload,ctx)=>{const input=payload.value;if(!isPlainObject(input)){payload.issues.push({expected:"record",code:"invalid_type",input,inst});return payload;}const proms=[];const values=def.keyType._zod.values;if(values){payload.value={};const recordKeys=new Set();for(const key of values){if(typeof key==="string"||typeof key==="number"||typeof key==="symbol"){recordKeys.add(typeof key==="number"?key.toString():key);const keyResult=def.keyType._zod.run({value:key,issues:[]},ctx);if(keyResult instanceof Promise){throw new Error("Async schemas not supported in object keys currently");}if(keyResult.issues.length){payload.issues.push({code:"invalid_key",origin:"record",issues:keyResult.issues.map(iss=>finalizeIssue(iss,ctx,config())),input:key,path:[key],inst});continue;}const outKey=keyResult.value;const result=def.valueType._zod.run({value:input[key],issues:[]},ctx);if(result instanceof Promise){proms.push(result.then(result=>{if(result.issues.length){payload.issues.push(...prefixIssues(key,result.issues));}payload.value[outKey]=result.value;}));}else {if(result.issues.length){payload.issues.push(...prefixIssues(key,result.issues));}payload.value[outKey]=result.value;}}}let unrecognized;for(const key in input){if(!recordKeys.has(key)){unrecognized=unrecognized??[];unrecognized.push(key);}}if(unrecognized&&unrecognized.length>0){payload.issues.push({code:"unrecognized_keys",input,inst,keys:unrecognized});}}else {payload.value={};// Reflect.ownKeys for Symbol-key support; filter non-enumerable to match z.object()
for(const key of Reflect.ownKeys(input)){if(key==="__proto__")continue;if(!Object.prototype.propertyIsEnumerable.call(input,key))continue;let keyResult=def.keyType._zod.run({value:key,issues:[]},ctx);if(keyResult instanceof Promise){throw new Error("Async schemas not supported in object keys currently");}// Numeric string fallback: if key is a numeric string and failed, retry with Number(key)
// This handles z.number(), z.literal([1, 2, 3]), and unions containing numeric literals
const checkNumericKey=typeof key==="string"&&number$1.test(key)&&keyResult.issues.length;if(checkNumericKey){const retryResult=def.keyType._zod.run({value:Number(key),issues:[]},ctx);if(retryResult instanceof Promise){throw new Error("Async schemas not supported in object keys currently");}if(retryResult.issues.length===0){keyResult=retryResult;}}if(keyResult.issues.length){if(def.mode==="loose"){// Pass through unchanged
payload.value[key]=input[key];}else {// Default "strict" behavior: error on invalid key
payload.issues.push({code:"invalid_key",origin:"record",issues:keyResult.issues.map(iss=>finalizeIssue(iss,ctx,config())),input:key,path:[key],inst});}continue;}const result=def.valueType._zod.run({value:input[key],issues:[]},ctx);if(result instanceof Promise){proms.push(result.then(result=>{if(result.issues.length){payload.issues.push(...prefixIssues(key,result.issues));}payload.value[keyResult.value]=result.value;}));}else {if(result.issues.length){payload.issues.push(...prefixIssues(key,result.issues));}payload.value[keyResult.value]=result.value;}}}if(proms.length){return Promise.all(proms).then(()=>payload);}return payload;};});const $ZodEnum=/*@__PURE__*/$constructor("$ZodEnum",(inst,def)=>{$ZodType.init(inst,def);const values=getEnumValues(def.entries);const valuesSet=new Set(values);inst._zod.values=valuesSet;inst._zod.pattern=new RegExp(`^(${values.filter(k=>propertyKeyTypes.has(typeof k)).map(o=>typeof o==="string"?escapeRegex(o):o.toString()).join("|")})$`);inst._zod.parse=(payload,_ctx)=>{const input=payload.value;if(valuesSet.has(input)){return payload;}payload.issues.push({code:"invalid_value",values,input,inst});return payload;};});const $ZodLiteral=/*@__PURE__*/$constructor("$ZodLiteral",(inst,def)=>{$ZodType.init(inst,def);if(def.values.length===0){throw new Error("Cannot create literal schema with no valid values");}const values=new Set(def.values);inst._zod.values=values;inst._zod.pattern=new RegExp(`^(${def.values.map(o=>typeof o==="string"?escapeRegex(o):o?escapeRegex(o.toString()):String(o)).join("|")})$`);inst._zod.parse=(payload,_ctx)=>{const input=payload.value;if(values.has(input)){return payload;}payload.issues.push({code:"invalid_value",values:def.values,input,inst});return payload;};});const $ZodTransform=/*@__PURE__*/$constructor("$ZodTransform",(inst,def)=>{$ZodType.init(inst,def);inst._zod.optin="optional";inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){throw new $ZodEncodeError(inst.constructor.name);}const _out=def.transform(payload.value,payload);if(ctx.async){const output=_out instanceof Promise?_out:Promise.resolve(_out);return output.then(output=>{payload.value=output;payload.fallback=true;return payload;});}if(_out instanceof Promise){throw new $ZodAsyncError();}payload.value=_out;payload.fallback=true;return payload;};});function handleOptionalResult(result,input){if(input===undefined&&(result.issues.length||result.fallback)){return {issues:[],value:undefined};}return result;}const $ZodOptional=/*@__PURE__*/$constructor("$ZodOptional",(inst,def)=>{$ZodType.init(inst,def);inst._zod.optin="optional";inst._zod.optout="optional";defineLazy(inst._zod,"values",()=>{return def.innerType._zod.values?new Set([...def.innerType._zod.values,undefined]):undefined;});defineLazy(inst._zod,"pattern",()=>{const pattern=def.innerType._zod.pattern;return pattern?new RegExp(`^(${cleanRegex(pattern.source)})?$`):undefined;});inst._zod.parse=(payload,ctx)=>{if(def.innerType._zod.optin==="optional"){const input=payload.value;const result=def.innerType._zod.run(payload,ctx);if(result instanceof Promise)return result.then(r=>handleOptionalResult(r,input));return handleOptionalResult(result,input);}if(payload.value===undefined){return payload;}return def.innerType._zod.run(payload,ctx);};});const $ZodExactOptional=/*@__PURE__*/$constructor("$ZodExactOptional",(inst,def)=>{// Call parent init - inherits optin/optout = "optional"
$ZodOptional.init(inst,def);// Override values/pattern to NOT add undefined
defineLazy(inst._zod,"values",()=>def.innerType._zod.values);defineLazy(inst._zod,"pattern",()=>def.innerType._zod.pattern);// Override parse to just delegate (no undefined handling)
inst._zod.parse=(payload,ctx)=>{return def.innerType._zod.run(payload,ctx);};});const $ZodNullable=/*@__PURE__*/$constructor("$ZodNullable",(inst,def)=>{$ZodType.init(inst,def);defineLazy(inst._zod,"optin",()=>def.innerType._zod.optin);defineLazy(inst._zod,"optout",()=>def.innerType._zod.optout);defineLazy(inst._zod,"pattern",()=>{const pattern=def.innerType._zod.pattern;return pattern?new RegExp(`^(${cleanRegex(pattern.source)}|null)$`):undefined;});defineLazy(inst._zod,"values",()=>{return def.innerType._zod.values?new Set([...def.innerType._zod.values,null]):undefined;});inst._zod.parse=(payload,ctx)=>{// Forward direction (decode): allow null to pass through
if(payload.value===null)return payload;return def.innerType._zod.run(payload,ctx);};});const $ZodDefault=/*@__PURE__*/$constructor("$ZodDefault",(inst,def)=>{$ZodType.init(inst,def);// inst._zod.qin = "true";
inst._zod.optin="optional";defineLazy(inst._zod,"values",()=>def.innerType._zod.values);inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){return def.innerType._zod.run(payload,ctx);}// Forward direction (decode): apply defaults for undefined input
if(payload.value===undefined){payload.value=def.defaultValue;/**
             * $ZodDefault returns the default value immediately in forward direction.
             * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */return payload;}// Forward direction: continue with default handling
const result=def.innerType._zod.run(payload,ctx);if(result instanceof Promise){return result.then(result=>handleDefaultResult(result,def));}return handleDefaultResult(result,def);};});function handleDefaultResult(payload,def){if(payload.value===undefined){payload.value=def.defaultValue;}return payload;}const $ZodPrefault=/*@__PURE__*/$constructor("$ZodPrefault",(inst,def)=>{$ZodType.init(inst,def);inst._zod.optin="optional";defineLazy(inst._zod,"values",()=>def.innerType._zod.values);inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){return def.innerType._zod.run(payload,ctx);}// Forward direction (decode): apply prefault for undefined input
if(payload.value===undefined){payload.value=def.defaultValue;}return def.innerType._zod.run(payload,ctx);};});const $ZodNonOptional=/*@__PURE__*/$constructor("$ZodNonOptional",(inst,def)=>{$ZodType.init(inst,def);defineLazy(inst._zod,"values",()=>{const v=def.innerType._zod.values;return v?new Set([...v].filter(x=>x!==undefined)):undefined;});inst._zod.parse=(payload,ctx)=>{const result=def.innerType._zod.run(payload,ctx);if(result instanceof Promise){return result.then(result=>handleNonOptionalResult(result,inst));}return handleNonOptionalResult(result,inst);};});function handleNonOptionalResult(payload,inst){if(!payload.issues.length&&payload.value===undefined){payload.issues.push({code:"invalid_type",expected:"nonoptional",input:payload.value,inst});}return payload;}const $ZodCatch=/*@__PURE__*/$constructor("$ZodCatch",(inst,def)=>{$ZodType.init(inst,def);inst._zod.optin="optional";defineLazy(inst._zod,"optout",()=>def.innerType._zod.optout);defineLazy(inst._zod,"values",()=>def.innerType._zod.values);inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){return def.innerType._zod.run(payload,ctx);}// Forward direction (decode): apply catch logic
const result=def.innerType._zod.run(payload,ctx);if(result instanceof Promise){return result.then(result=>{payload.value=result.value;if(result.issues.length){payload.value=def.catchValue({...payload,error:{issues:result.issues.map(iss=>finalizeIssue(iss,ctx,config()))},input:payload.value});payload.issues=[];payload.fallback=true;}return payload;});}payload.value=result.value;if(result.issues.length){payload.value=def.catchValue({...payload,error:{issues:result.issues.map(iss=>finalizeIssue(iss,ctx,config()))},input:payload.value});payload.issues=[];payload.fallback=true;}return payload;};});const $ZodPipe=/*@__PURE__*/$constructor("$ZodPipe",(inst,def)=>{$ZodType.init(inst,def);defineLazy(inst._zod,"values",()=>def.in._zod.values);defineLazy(inst._zod,"optin",()=>def.in._zod.optin);defineLazy(inst._zod,"optout",()=>def.out._zod.optout);defineLazy(inst._zod,"propValues",()=>def.in._zod.propValues);inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){const right=def.out._zod.run(payload,ctx);if(right instanceof Promise){return right.then(right=>handlePipeResult(right,def.in,ctx));}return handlePipeResult(right,def.in,ctx);}const left=def.in._zod.run(payload,ctx);if(left instanceof Promise){return left.then(left=>handlePipeResult(left,def.out,ctx));}return handlePipeResult(left,def.out,ctx);};});function handlePipeResult(left,next,ctx){if(left.issues.length){// prevent further checks
left.aborted=true;return left;}return next._zod.run({value:left.value,issues:left.issues,fallback:left.fallback},ctx);}const $ZodPreprocess=/*@__PURE__*/$constructor("$ZodPreprocess",(inst,def)=>{$ZodPipe.init(inst,def);});const $ZodReadonly=/*@__PURE__*/$constructor("$ZodReadonly",(inst,def)=>{$ZodType.init(inst,def);defineLazy(inst._zod,"propValues",()=>def.innerType._zod.propValues);defineLazy(inst._zod,"values",()=>def.innerType._zod.values);defineLazy(inst._zod,"optin",()=>def.innerType?._zod?.optin);defineLazy(inst._zod,"optout",()=>def.innerType?._zod?.optout);inst._zod.parse=(payload,ctx)=>{if(ctx.direction==="backward"){return def.innerType._zod.run(payload,ctx);}const result=def.innerType._zod.run(payload,ctx);if(result instanceof Promise){return result.then(handleReadonlyResult);}return handleReadonlyResult(result);};});function handleReadonlyResult(payload){payload.value=Object.freeze(payload.value);return payload;}const $ZodCustom=/*@__PURE__*/$constructor("$ZodCustom",(inst,def)=>{$ZodCheck.init(inst,def);$ZodType.init(inst,def);inst._zod.parse=(payload,_)=>{return payload;};inst._zod.check=payload=>{const input=payload.value;const r=def.fn(input);if(r instanceof Promise){return r.then(r=>handleRefineResult(r,payload,input,inst));}handleRefineResult(r,payload,input,inst);return;};});function handleRefineResult(result,payload,input,inst){if(!result){const _iss={code:"custom",input,inst,// incorporates params.error into issue reporting
path:[...(inst._zod.def.path??[])],// incorporates params.error into issue reporting
continue:!inst._zod.def.abort// params: inst._zod.def.params,
};if(inst._zod.def.params)_iss.params=inst._zod.def.params;payload.issues.push(issue(_iss));}}

var _a$1;class $ZodRegistry{constructor(){this._map=new WeakMap();this._idmap=new Map();}add(schema,..._meta){const meta=_meta[0];this._map.set(schema,meta);if(meta&&typeof meta==="object"&&"id"in meta){this._idmap.set(meta.id,schema);}return this;}clear(){this._map=new WeakMap();this._idmap=new Map();return this;}remove(schema){const meta=this._map.get(schema);if(meta&&typeof meta==="object"&&"id"in meta){this._idmap.delete(meta.id);}this._map.delete(schema);return this;}get(schema){// return this._map.get(schema) as any;
// inherit metadata
const p=schema._zod.parent;if(p){const pm={...(this.get(p)??{})};delete pm.id;// do not inherit id
const f={...pm,...this._map.get(schema)};return Object.keys(f).length?f:undefined;}return this._map.get(schema);}has(schema){return this._map.has(schema);}}// registries
function registry(){return new $ZodRegistry();}(_a$1=globalThis).__zod_globalRegistry??(_a$1.__zod_globalRegistry=registry());const globalRegistry=globalThis.__zod_globalRegistry;

function _string(Class,params){return new Class({type:"string",...normalizeParams(params)});}
function _email(Class,params){return new Class({type:"string",format:"email",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _guid(Class,params){return new Class({type:"string",format:"guid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _uuid(Class,params){return new Class({type:"string",format:"uuid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _uuidv4(Class,params){return new Class({type:"string",format:"uuid",check:"string_format",abort:false,version:"v4",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _uuidv6(Class,params){return new Class({type:"string",format:"uuid",check:"string_format",abort:false,version:"v6",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _uuidv7(Class,params){return new Class({type:"string",format:"uuid",check:"string_format",abort:false,version:"v7",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _url(Class,params){return new Class({type:"string",format:"url",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _emoji(Class,params){return new Class({type:"string",format:"emoji",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _nanoid(Class,params){return new Class({type:"string",format:"nanoid",check:"string_format",abort:false,...normalizeParams(params)});}/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link _cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */// @__NO_SIDE_EFFECTS__
function _cuid(Class,params){return new Class({type:"string",format:"cuid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _cuid2(Class,params){return new Class({type:"string",format:"cuid2",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _ulid(Class,params){return new Class({type:"string",format:"ulid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _xid(Class,params){return new Class({type:"string",format:"xid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _ksuid(Class,params){return new Class({type:"string",format:"ksuid",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _ipv4(Class,params){return new Class({type:"string",format:"ipv4",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _ipv6(Class,params){return new Class({type:"string",format:"ipv6",check:"string_format",abort:false,...normalizeParams(params)});}
function _cidrv4(Class,params){return new Class({type:"string",format:"cidrv4",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _cidrv6(Class,params){return new Class({type:"string",format:"cidrv6",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _base64(Class,params){return new Class({type:"string",format:"base64",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _base64url(Class,params){return new Class({type:"string",format:"base64url",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _e164(Class,params){return new Class({type:"string",format:"e164",check:"string_format",abort:false,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _jwt(Class,params){return new Class({type:"string",format:"jwt",check:"string_format",abort:false,...normalizeParams(params)});}function _isoDateTime(Class,params){return new Class({type:"string",format:"datetime",check:"string_format",offset:false,local:false,precision:null,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _isoDate(Class,params){return new Class({type:"string",format:"date",check:"string_format",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _isoTime(Class,params){return new Class({type:"string",format:"time",check:"string_format",precision:null,...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _isoDuration(Class,params){return new Class({type:"string",format:"duration",check:"string_format",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _number(Class,params){return new Class({type:"number",checks:[],...normalizeParams(params)});}
function _int(Class,params){return new Class({type:"number",check:"number_format",abort:false,format:"safeint",...normalizeParams(params)});}
function _boolean(Class,params){return new Class({type:"boolean",...normalizeParams(params)});}
function _null$1(Class,params){return new Class({type:"null",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _any(Class){return new Class({type:"any"});}// @__NO_SIDE_EFFECTS__
function _unknown(Class){return new Class({type:"unknown"});}// @__NO_SIDE_EFFECTS__
function _never(Class,params){return new Class({type:"never",...normalizeParams(params)});}
function _lt(value,params){return new $ZodCheckLessThan({check:"less_than",...normalizeParams(params),value,inclusive:false});}// @__NO_SIDE_EFFECTS__
function _lte(value,params){return new $ZodCheckLessThan({check:"less_than",...normalizeParams(params),value,inclusive:true});}function _gt(value,params){return new $ZodCheckGreaterThan({check:"greater_than",...normalizeParams(params),value,inclusive:false});}// @__NO_SIDE_EFFECTS__
function _gte(value,params){return new $ZodCheckGreaterThan({check:"greater_than",...normalizeParams(params),value,inclusive:true});}function _multipleOf(value,params){return new $ZodCheckMultipleOf({check:"multiple_of",...normalizeParams(params),value});}
function _maxLength(maximum,params){const ch=new $ZodCheckMaxLength({check:"max_length",...normalizeParams(params),maximum});return ch;}// @__NO_SIDE_EFFECTS__
function _minLength(minimum,params){return new $ZodCheckMinLength({check:"min_length",...normalizeParams(params),minimum});}// @__NO_SIDE_EFFECTS__
function _length(length,params){return new $ZodCheckLengthEquals({check:"length_equals",...normalizeParams(params),length});}// @__NO_SIDE_EFFECTS__
function _regex(pattern,params){return new $ZodCheckRegex({check:"string_format",format:"regex",...normalizeParams(params),pattern});}// @__NO_SIDE_EFFECTS__
function _lowercase(params){return new $ZodCheckLowerCase({check:"string_format",format:"lowercase",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _uppercase(params){return new $ZodCheckUpperCase({check:"string_format",format:"uppercase",...normalizeParams(params)});}// @__NO_SIDE_EFFECTS__
function _includes(includes,params){return new $ZodCheckIncludes({check:"string_format",format:"includes",...normalizeParams(params),includes});}// @__NO_SIDE_EFFECTS__
function _startsWith(prefix,params){return new $ZodCheckStartsWith({check:"string_format",format:"starts_with",...normalizeParams(params),prefix});}// @__NO_SIDE_EFFECTS__
function _endsWith(suffix,params){return new $ZodCheckEndsWith({check:"string_format",format:"ends_with",...normalizeParams(params),suffix});}
function _overwrite(tx){return new $ZodCheckOverwrite({check:"overwrite",tx});}// normalize
// @__NO_SIDE_EFFECTS__
function _normalize(form){return _overwrite(input=>input.normalize(form));}// trim
// @__NO_SIDE_EFFECTS__
function _trim(){return _overwrite(input=>input.trim());}// toLowerCase
// @__NO_SIDE_EFFECTS__
function _toLowerCase(){return _overwrite(input=>input.toLowerCase());}// toUpperCase
// @__NO_SIDE_EFFECTS__
function _toUpperCase(){return _overwrite(input=>input.toUpperCase());}// slugify
// @__NO_SIDE_EFFECTS__
function _slugify(){return _overwrite(input=>slugify(input));}// @__NO_SIDE_EFFECTS__
function _array(Class,element,params){return new Class({type:"array",element,// get element() {
//   return element;
// },
...normalizeParams(params)});}
function _custom(Class,fn,_params){const norm=normalizeParams(_params);norm.abort??(norm.abort=true);// default to abort:false
const schema=new Class({type:"custom",check:"custom",fn:fn,...norm});return schema;}// same as _custom but defaults to abort:false
// @__NO_SIDE_EFFECTS__
function _refine(Class,fn,_params){const schema=new Class({type:"custom",check:"custom",fn:fn,...normalizeParams(_params)});return schema;}// @__NO_SIDE_EFFECTS__
function _superRefine(fn,params){const ch=_check(payload=>{payload.addIssue=issue$1=>{if(typeof issue$1==="string"){payload.issues.push(issue(issue$1,payload.value,ch._zod.def));}else {// for Zod 3 backwards compatibility
const _issue=issue$1;if(_issue.fatal)_issue.continue=false;_issue.code??(_issue.code="custom");_issue.input??(_issue.input=payload.value);_issue.inst??(_issue.inst=ch);_issue.continue??(_issue.continue=!ch._zod.def.abort);// abort is always undefined, so this is always true...
payload.issues.push(issue(_issue));}};return fn(payload.value,payload);},params);return ch;}// @__NO_SIDE_EFFECTS__
function _check(fn,params){const ch=new $ZodCheck({check:"custom",...normalizeParams(params)});ch._zod.check=fn;return ch;}

//   return {
//     processor: inputs.processor,
//     metadataRegistry: inputs.metadata ?? globalRegistry,
//     target: inputs.target ?? "draft-2020-12",
//     unrepresentable: inputs.unrepresentable ?? "throw",
//   };
// }
function initializeContext(params){// Normalize target: convert old non-hyphenated versions to hyphenated versions
let target=params?.target??"draft-2020-12";if(target==="draft-4")target="draft-04";if(target==="draft-7")target="draft-07";return {processors:params.processors??{},metadataRegistry:params?.metadata??globalRegistry,target,unrepresentable:params?.unrepresentable??"throw",override:params?.override??(()=>{}),io:params?.io??"output",counter:0,seen:new Map(),cycles:params?.cycles??"ref",reused:params?.reused??"inline",external:params?.external??undefined};}function process$1(schema,ctx,_params={path:[],schemaPath:[]}){var _a;const def=schema._zod.def;// check for schema in seens
const seen=ctx.seen.get(schema);if(seen){seen.count++;// check if cycle
const isCycle=_params.schemaPath.includes(schema);if(isCycle){seen.cycle=_params.path;}return seen.schema;}// initialize
const result={schema:{},count:1,cycle:undefined,path:_params.path};ctx.seen.set(schema,result);// custom method overrides default behavior
const overrideSchema=schema._zod.toJSONSchema?.();if(overrideSchema){result.schema=overrideSchema;}else {const params={..._params,schemaPath:[..._params.schemaPath,schema],path:_params.path};if(schema._zod.processJSONSchema){schema._zod.processJSONSchema(ctx,result.schema,params);}else {const _json=result.schema;const processor=ctx.processors[def.type];if(!processor){throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);}processor(schema,ctx,_json,params);}const parent=schema._zod.parent;if(parent){// Also set ref if processor didn't (for inheritance)
if(!result.ref)result.ref=parent;process$1(parent,ctx,params);ctx.seen.get(parent).isParent=true;}}// metadata
const meta=ctx.metadataRegistry.get(schema);if(meta)Object.assign(result.schema,meta);if(ctx.io==="input"&&isTransforming(schema)){// examples/defaults only apply to output type of pipe
delete result.schema.examples;delete result.schema.default;}// set prefault as default
if(ctx.io==="input"&&"_prefault"in result.schema)(_a=result.schema).default??(_a.default=result.schema._prefault);delete result.schema._prefault;// pulling fresh from ctx.seen in case it was overwritten
const _result=ctx.seen.get(schema);return _result.schema;}function extractDefs(ctx,schema// params: EmitParams
){// iterate over seen map;
const root=ctx.seen.get(schema);if(!root)throw new Error("Unprocessed schema. This is a bug in Zod.");// Track ids to detect duplicates across different schemas
const idToSchema=new Map();for(const entry of ctx.seen.entries()){const id=ctx.metadataRegistry.get(entry[0])?.id;if(id){const existing=idToSchema.get(id);if(existing&&existing!==entry[0]){throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);}idToSchema.set(id,entry[0]);}}// returns a ref to the schema
// defId will be empty if the ref points to an external schema (or #)
const makeURI=entry=>{// comparing the seen objects because sometimes
// multiple schemas map to the same seen object.
// e.g. lazy
// external is configured
const defsSegment=ctx.target==="draft-2020-12"?"$defs":"definitions";if(ctx.external){const externalId=ctx.external.registry.get(entry[0])?.id;// ?? "__shared";// `__schema${ctx.counter++}`;
// check if schema is in the external registry
const uriGenerator=ctx.external.uri??(id=>id);if(externalId){return {ref:uriGenerator(externalId)};}// otherwise, add to __shared
const id=entry[1].defId??entry[1].schema.id??`schema${ctx.counter++}`;entry[1].defId=id;// set defId so it will be reused if needed
return {defId:id,ref:`${uriGenerator("__shared")}#/${defsSegment}/${id}`};}if(entry[1]===root){return {ref:"#"};}// self-contained schema
const uriPrefix=`#`;const defUriPrefix=`${uriPrefix}/${defsSegment}/`;const defId=entry[1].schema.id??`__schema${ctx.counter++}`;return {defId,ref:defUriPrefix+defId};};// stored cached version in `def` property
// remove all properties, set $ref
const extractToDef=entry=>{// if the schema is already a reference, do not extract it
if(entry[1].schema.$ref){return;}const seen=entry[1];const{ref,defId}=makeURI(entry);seen.def={...seen.schema};// defId won't be set if the schema is a reference to an external schema
// or if the schema is the root schema
if(defId)seen.defId=defId;// wipe away all properties except $ref
const schema=seen.schema;for(const key in schema){delete schema[key];}schema.$ref=ref;};// throw on cycles
// break cycles
if(ctx.cycles==="throw"){for(const entry of ctx.seen.entries()){const seen=entry[1];if(seen.cycle){throw new Error("Cycle detected: "+`#/${seen.cycle?.join("/")}/<root>`+'\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');}}}// extract schemas into $defs
for(const entry of ctx.seen.entries()){const seen=entry[1];// convert root schema to # $ref
if(schema===entry[0]){extractToDef(entry);// this has special handling for the root schema
continue;}// extract schemas that are in the external registry
if(ctx.external){const ext=ctx.external.registry.get(entry[0])?.id;if(schema!==entry[0]&&ext){extractToDef(entry);continue;}}// extract schemas with `id` meta
const id=ctx.metadataRegistry.get(entry[0])?.id;if(id){extractToDef(entry);continue;}// break cycles
if(seen.cycle){// any
extractToDef(entry);continue;}// extract reused schemas
if(seen.count>1){if(ctx.reused==="ref"){extractToDef(entry);// biome-ignore lint:
continue;}}}}function finalize(ctx,schema){const root=ctx.seen.get(schema);if(!root)throw new Error("Unprocessed schema. This is a bug in Zod.");// flatten refs - inherit properties from parent schemas
const flattenRef=zodSchema=>{const seen=ctx.seen.get(zodSchema);// already processed
if(seen.ref===null)return;const schema=seen.def??seen.schema;const _cached={...schema};const ref=seen.ref;seen.ref=null;// prevent infinite recursion
if(ref){flattenRef(ref);const refSeen=ctx.seen.get(ref);const refSchema=refSeen.schema;// merge referenced schema into current
if(refSchema.$ref&&(ctx.target==="draft-07"||ctx.target==="draft-04"||ctx.target==="openapi-3.0")){// older drafts can't combine $ref with other properties
schema.allOf=schema.allOf??[];schema.allOf.push(refSchema);}else {Object.assign(schema,refSchema);}// restore child's own properties (child wins)
Object.assign(schema,_cached);const isParentRef=zodSchema._zod.parent===ref;// For parent chain, child is a refinement - remove parent-only properties
if(isParentRef){for(const key in schema){if(key==="$ref"||key==="allOf")continue;if(!(key in _cached)){delete schema[key];}}}// When ref was extracted to $defs, remove properties that match the definition
if(refSchema.$ref&&refSeen.def){for(const key in schema){if(key==="$ref"||key==="allOf")continue;if(key in refSeen.def&&JSON.stringify(schema[key])===JSON.stringify(refSeen.def[key])){delete schema[key];}}}}// If parent was extracted (has $ref), propagate $ref to this schema
// This handles cases like: readonly().meta({id}).describe()
// where processor sets ref to innerType but parent should be referenced
const parent=zodSchema._zod.parent;if(parent&&parent!==ref){// Ensure parent is processed first so its def has inherited properties
flattenRef(parent);const parentSeen=ctx.seen.get(parent);if(parentSeen?.schema.$ref){schema.$ref=parentSeen.schema.$ref;// De-duplicate with parent's definition
if(parentSeen.def){for(const key in schema){if(key==="$ref"||key==="allOf")continue;if(key in parentSeen.def&&JSON.stringify(schema[key])===JSON.stringify(parentSeen.def[key])){delete schema[key];}}}}}// execute overrides
ctx.override({zodSchema:zodSchema,jsonSchema:schema,path:seen.path??[]});};for(const entry of [...ctx.seen.entries()].reverse()){flattenRef(entry[0]);}const result={};if(ctx.target==="draft-2020-12"){result.$schema="https://json-schema.org/draft/2020-12/schema";}else if(ctx.target==="draft-07"){result.$schema="http://json-schema.org/draft-07/schema#";}else if(ctx.target==="draft-04"){result.$schema="http://json-schema.org/draft-04/schema#";}else if(ctx.target==="openapi-3.0");else;if(ctx.external?.uri){const id=ctx.external.registry.get(schema)?.id;if(!id)throw new Error("Schema is missing an `id` property");result.$id=ctx.external.uri(id);}Object.assign(result,root.def??root.schema);// The `id` in `.meta()` is a Zod-specific registration tag used to extract
// schemas into $defs — it is not user-facing JSON Schema metadata. Strip it
// from the output body where it would otherwise leak. The id is preserved
// implicitly via the $defs key (and via $ref paths).
const rootMetaId=ctx.metadataRegistry.get(schema)?.id;if(rootMetaId!==undefined&&result.id===rootMetaId)delete result.id;// build defs object
const defs=ctx.external?.defs??{};for(const entry of ctx.seen.entries()){const seen=entry[1];if(seen.def&&seen.defId){if(seen.def.id===seen.defId)delete seen.def.id;defs[seen.defId]=seen.def;}}// set definitions in result
if(ctx.external);else {if(Object.keys(defs).length>0){if(ctx.target==="draft-2020-12"){result.$defs=defs;}else {result.definitions=defs;}}}try{// this "finalizes" this schema and ensures all cycles are removed
// each call to finalize() is functionally independent
// though the seen map is shared
const finalized=JSON.parse(JSON.stringify(result));Object.defineProperty(finalized,"~standard",{value:{...schema["~standard"],jsonSchema:{input:createStandardJSONSchemaMethod(schema,"input",ctx.processors),output:createStandardJSONSchemaMethod(schema,"output",ctx.processors)}},enumerable:false,writable:false});return finalized;}catch(_err){throw new Error("Error converting schema to JSON.");}}function isTransforming(_schema,_ctx){const ctx=_ctx??{seen:new Set()};if(ctx.seen.has(_schema))return false;ctx.seen.add(_schema);const def=_schema._zod.def;if(def.type==="transform")return true;if(def.type==="array")return isTransforming(def.element,ctx);if(def.type==="set")return isTransforming(def.valueType,ctx);if(def.type==="lazy")return isTransforming(def.getter(),ctx);if(def.type==="promise"||def.type==="optional"||def.type==="nonoptional"||def.type==="nullable"||def.type==="readonly"||def.type==="default"||def.type==="prefault"){return isTransforming(def.innerType,ctx);}if(def.type==="intersection"){return isTransforming(def.left,ctx)||isTransforming(def.right,ctx);}if(def.type==="record"||def.type==="map"){return isTransforming(def.keyType,ctx)||isTransforming(def.valueType,ctx);}if(def.type==="pipe"){if(_schema._zod.traits.has("$ZodCodec"))return true;return isTransforming(def.in,ctx)||isTransforming(def.out,ctx);}if(def.type==="object"){for(const key in def.shape){if(isTransforming(def.shape[key],ctx))return true;}return false;}if(def.type==="union"){for(const option of def.options){if(isTransforming(option,ctx))return true;}return false;}if(def.type==="tuple"){for(const item of def.items){if(isTransforming(item,ctx))return true;}if(def.rest&&isTransforming(def.rest,ctx))return true;return false;}return false;}/**
 * Creates a toJSONSchema method for a schema instance.
 * This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
 */const createToJSONSchemaMethod=(schema,processors={})=>params=>{const ctx=initializeContext({...params,processors});process$1(schema,ctx);extractDefs(ctx,schema);return finalize(ctx,schema);};const createStandardJSONSchemaMethod=(schema,io,processors={})=>params=>{const{libraryOptions,target}=params??{};const ctx=initializeContext({...(libraryOptions??{}),target,io,processors});process$1(schema,ctx);extractDefs(ctx,schema);return finalize(ctx,schema);};

const formatMap={guid:"uuid",url:"uri",datetime:"date-time",json_string:"json-string",regex:""// do not set
};// ==================== SIMPLE TYPE PROCESSORS ====================
const stringProcessor=(schema,ctx,_json,_params)=>{const json=_json;json.type="string";const{minimum,maximum,format,patterns,contentEncoding}=schema._zod.bag;if(typeof minimum==="number")json.minLength=minimum;if(typeof maximum==="number")json.maxLength=maximum;// custom pattern overrides format
if(format){json.format=formatMap[format]??format;if(json.format==="")delete json.format;// empty format is not valid
// JSON Schema format: "time" requires a full time with offset or Z
// z.iso.time() does not include timezone information, so format: "time" should never be used
if(format==="time"){delete json.format;}}if(contentEncoding)json.contentEncoding=contentEncoding;if(patterns&&patterns.size>0){const regexes=[...patterns];if(regexes.length===1)json.pattern=regexes[0].source;else if(regexes.length>1){json.allOf=[...regexes.map(regex=>({...(ctx.target==="draft-07"||ctx.target==="draft-04"||ctx.target==="openapi-3.0"?{type:"string"}:{}),pattern:regex.source}))];}}};const numberProcessor=(schema,ctx,_json,_params)=>{const json=_json;const{minimum,maximum,format,multipleOf,exclusiveMaximum,exclusiveMinimum}=schema._zod.bag;if(typeof format==="string"&&format.includes("int"))json.type="integer";else json.type="number";// when both minimum and exclusiveMinimum exist, pick the more restrictive one
const exMin=typeof exclusiveMinimum==="number"&&exclusiveMinimum>=(minimum??Number.NEGATIVE_INFINITY);const exMax=typeof exclusiveMaximum==="number"&&exclusiveMaximum<=(maximum??Number.POSITIVE_INFINITY);const legacy=ctx.target==="draft-04"||ctx.target==="openapi-3.0";if(exMin){if(legacy){json.minimum=exclusiveMinimum;json.exclusiveMinimum=true;}else {json.exclusiveMinimum=exclusiveMinimum;}}else if(typeof minimum==="number"){json.minimum=minimum;}if(exMax){if(legacy){json.maximum=exclusiveMaximum;json.exclusiveMaximum=true;}else {json.exclusiveMaximum=exclusiveMaximum;}}else if(typeof maximum==="number"){json.maximum=maximum;}if(typeof multipleOf==="number")json.multipleOf=multipleOf;};const booleanProcessor=(_schema,_ctx,json,_params)=>{json.type="boolean";};const bigintProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("BigInt cannot be represented in JSON Schema");}};const symbolProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Symbols cannot be represented in JSON Schema");}};const nullProcessor=(_schema,ctx,json,_params)=>{if(ctx.target==="openapi-3.0"){json.type="string";json.nullable=true;json.enum=[null];}else {json.type="null";}};const undefinedProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Undefined cannot be represented in JSON Schema");}};const voidProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Void cannot be represented in JSON Schema");}};const neverProcessor=(_schema,_ctx,json,_params)=>{json.not={};};const anyProcessor=(_schema,_ctx,_json,_params)=>{// empty schema accepts anything
};const unknownProcessor=(_schema,_ctx,_json,_params)=>{// empty schema accepts anything
};const dateProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Date cannot be represented in JSON Schema");}};const enumProcessor=(schema,_ctx,json,_params)=>{const def=schema._zod.def;const values=getEnumValues(def.entries);// Number enums can have both string and number values
if(values.every(v=>typeof v==="number"))json.type="number";if(values.every(v=>typeof v==="string"))json.type="string";json.enum=values;};const literalProcessor=(schema,ctx,json,_params)=>{const def=schema._zod.def;const vals=[];for(const val of def.values){if(val===undefined){if(ctx.unrepresentable==="throw"){throw new Error("Literal `undefined` cannot be represented in JSON Schema");}}else if(typeof val==="bigint"){if(ctx.unrepresentable==="throw"){throw new Error("BigInt literals cannot be represented in JSON Schema");}else {vals.push(Number(val));}}else {vals.push(val);}}if(vals.length===0);else if(vals.length===1){const val=vals[0];json.type=val===null?"null":typeof val;if(ctx.target==="draft-04"||ctx.target==="openapi-3.0"){json.enum=[val];}else {json.const=val;}}else {if(vals.every(v=>typeof v==="number"))json.type="number";if(vals.every(v=>typeof v==="string"))json.type="string";if(vals.every(v=>typeof v==="boolean"))json.type="boolean";if(vals.every(v=>v===null))json.type="null";json.enum=vals;}};const nanProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("NaN cannot be represented in JSON Schema");}};const templateLiteralProcessor=(schema,_ctx,json,_params)=>{const _json=json;const pattern=schema._zod.pattern;if(!pattern)throw new Error("Pattern not found in template literal");_json.type="string";_json.pattern=pattern.source;};const fileProcessor=(schema,_ctx,json,_params)=>{const _json=json;const file={type:"string",format:"binary",contentEncoding:"binary"};const{minimum,maximum,mime}=schema._zod.bag;if(minimum!==undefined)file.minLength=minimum;if(maximum!==undefined)file.maxLength=maximum;if(mime){if(mime.length===1){file.contentMediaType=mime[0];Object.assign(_json,file);}else {Object.assign(_json,file);// shared props at root
_json.anyOf=mime.map(m=>({contentMediaType:m}));// only contentMediaType differs
}}else {Object.assign(_json,file);}};const successProcessor=(_schema,_ctx,json,_params)=>{json.type="boolean";};const customProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Custom types cannot be represented in JSON Schema");}};const functionProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Function types cannot be represented in JSON Schema");}};const transformProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Transforms cannot be represented in JSON Schema");}};const mapProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Map cannot be represented in JSON Schema");}};const setProcessor=(_schema,ctx,_json,_params)=>{if(ctx.unrepresentable==="throw"){throw new Error("Set cannot be represented in JSON Schema");}};// ==================== COMPOSITE TYPE PROCESSORS ====================
const arrayProcessor=(schema,ctx,_json,params)=>{const json=_json;const def=schema._zod.def;const{minimum,maximum}=schema._zod.bag;if(typeof minimum==="number")json.minItems=minimum;if(typeof maximum==="number")json.maxItems=maximum;json.type="array";json.items=process$1(def.element,ctx,{...params,path:[...params.path,"items"]});};const objectProcessor=(schema,ctx,_json,params)=>{const json=_json;const def=schema._zod.def;json.type="object";json.properties={};const shape=def.shape;for(const key in shape){json.properties[key]=process$1(shape[key],ctx,{...params,path:[...params.path,"properties",key]});}// required keys
const allKeys=new Set(Object.keys(shape));const requiredKeys=new Set([...allKeys].filter(key=>{const v=def.shape[key]._zod;if(ctx.io==="input"){return v.optin===undefined;}else {return v.optout===undefined;}}));if(requiredKeys.size>0){json.required=Array.from(requiredKeys);}// catchall
if(def.catchall?._zod.def.type==="never"){// strict
json.additionalProperties=false;}else if(!def.catchall){// regular
if(ctx.io==="output")json.additionalProperties=false;}else if(def.catchall){json.additionalProperties=process$1(def.catchall,ctx,{...params,path:[...params.path,"additionalProperties"]});}};const unionProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;// Exclusive unions (inclusive === false) use oneOf (exactly one match) instead of anyOf (one or more matches)
// This includes both z.xor() and discriminated unions
const isExclusive=def.inclusive===false;const options=def.options.map((x,i)=>process$1(x,ctx,{...params,path:[...params.path,isExclusive?"oneOf":"anyOf",i]}));if(isExclusive){json.oneOf=options;}else {json.anyOf=options;}};const intersectionProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;const a=process$1(def.left,ctx,{...params,path:[...params.path,"allOf",0]});const b=process$1(def.right,ctx,{...params,path:[...params.path,"allOf",1]});const isSimpleIntersection=val=>"allOf"in val&&Object.keys(val).length===1;const allOf=[...(isSimpleIntersection(a)?a.allOf:[a]),...(isSimpleIntersection(b)?b.allOf:[b])];json.allOf=allOf;};const tupleProcessor=(schema,ctx,_json,params)=>{const json=_json;const def=schema._zod.def;json.type="array";const prefixPath=ctx.target==="draft-2020-12"?"prefixItems":"items";const restPath=ctx.target==="draft-2020-12"?"items":ctx.target==="openapi-3.0"?"items":"additionalItems";const prefixItems=def.items.map((x,i)=>process$1(x,ctx,{...params,path:[...params.path,prefixPath,i]}));const rest=def.rest?process$1(def.rest,ctx,{...params,path:[...params.path,restPath,...(ctx.target==="openapi-3.0"?[def.items.length]:[])]}):null;if(ctx.target==="draft-2020-12"){json.prefixItems=prefixItems;if(rest){json.items=rest;}}else if(ctx.target==="openapi-3.0"){json.items={anyOf:prefixItems};if(rest){json.items.anyOf.push(rest);}json.minItems=prefixItems.length;if(!rest){json.maxItems=prefixItems.length;}}else {json.items=prefixItems;if(rest){json.additionalItems=rest;}}// length
const{minimum,maximum}=schema._zod.bag;if(typeof minimum==="number")json.minItems=minimum;if(typeof maximum==="number")json.maxItems=maximum;};const recordProcessor=(schema,ctx,_json,params)=>{const json=_json;const def=schema._zod.def;json.type="object";// For looseRecord with regex patterns, use patternProperties
// This correctly represents "only validate keys matching the pattern" semantics
// and composes well with allOf (intersections)
const keyType=def.keyType;const keyBag=keyType._zod.bag;const patterns=keyBag?.patterns;if(def.mode==="loose"&&patterns&&patterns.size>0){// Use patternProperties for looseRecord with regex patterns
const valueSchema=process$1(def.valueType,ctx,{...params,path:[...params.path,"patternProperties","*"]});json.patternProperties={};for(const pattern of patterns){json.patternProperties[pattern.source]=valueSchema;}}else {// Default behavior: use propertyNames + additionalProperties
if(ctx.target==="draft-07"||ctx.target==="draft-2020-12"){json.propertyNames=process$1(def.keyType,ctx,{...params,path:[...params.path,"propertyNames"]});}json.additionalProperties=process$1(def.valueType,ctx,{...params,path:[...params.path,"additionalProperties"]});}// Add required for keys with discrete values (enum, literal, etc.)
const keyValues=keyType._zod.values;if(keyValues){const validKeyValues=[...keyValues].filter(v=>typeof v==="string"||typeof v==="number");if(validKeyValues.length>0){json.required=validKeyValues;}}};const nullableProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;const inner=process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);if(ctx.target==="openapi-3.0"){seen.ref=def.innerType;json.nullable=true;}else {json.anyOf=[inner,{type:"null"}];}};const nonoptionalProcessor=(schema,ctx,_json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;};const defaultProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;json.default=JSON.parse(JSON.stringify(def.defaultValue));};const prefaultProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;if(ctx.io==="input")json._prefault=JSON.parse(JSON.stringify(def.defaultValue));};const catchProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;let catchValue;try{catchValue=def.catchValue(undefined);}catch{throw new Error("Dynamic catch values are not supported in JSON Schema");}json.default=catchValue;};const pipeProcessor=(schema,ctx,_json,params)=>{const def=schema._zod.def;const inIsTransform=def.in._zod.traits.has("$ZodTransform");const innerType=ctx.io==="input"?inIsTransform?def.out:def.in:def.out;process$1(innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=innerType;};const readonlyProcessor=(schema,ctx,json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;json.readOnly=true;};const promiseProcessor=(schema,ctx,_json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;};const optionalProcessor=(schema,ctx,_json,params)=>{const def=schema._zod.def;process$1(def.innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=def.innerType;};const lazyProcessor=(schema,ctx,_json,params)=>{const innerType=schema._zod.innerType;process$1(innerType,ctx,params);const seen=ctx.seen.get(schema);seen.ref=innerType;};// ==================== ALL PROCESSORS ====================
const allProcessors={string:stringProcessor,number:numberProcessor,boolean:booleanProcessor,bigint:bigintProcessor,symbol:symbolProcessor,null:nullProcessor,undefined:undefinedProcessor,void:voidProcessor,never:neverProcessor,any:anyProcessor,unknown:unknownProcessor,date:dateProcessor,enum:enumProcessor,literal:literalProcessor,nan:nanProcessor,template_literal:templateLiteralProcessor,file:fileProcessor,success:successProcessor,custom:customProcessor,function:functionProcessor,transform:transformProcessor,map:mapProcessor,set:setProcessor,array:arrayProcessor,object:objectProcessor,union:unionProcessor,intersection:intersectionProcessor,tuple:tupleProcessor,record:recordProcessor,nullable:nullableProcessor,nonoptional:nonoptionalProcessor,default:defaultProcessor,prefault:prefaultProcessor,catch:catchProcessor,pipe:pipeProcessor,readonly:readonlyProcessor,promise:promiseProcessor,optional:optionalProcessor,lazy:lazyProcessor};function toJSONSchema(input,params){if("_idmap"in input){// Registry case
const registry=input;const ctx=initializeContext({...params,processors:allProcessors});const defs={};// First pass: process all schemas to build the seen map
for(const entry of registry._idmap.entries()){const[_,schema]=entry;process$1(schema,ctx);}const schemas={};const external={registry,uri:params?.uri,defs};// Update the context with external configuration
ctx.external=external;// Second pass: emit each schema
for(const entry of registry._idmap.entries()){const[key,schema]=entry;extractDefs(ctx,schema);schemas[key]=finalize(ctx,schema);}if(Object.keys(defs).length>0){const defsSegment=ctx.target==="draft-2020-12"?"$defs":"definitions";schemas.__shared={[defsSegment]:defs};}return {schemas};}// Single schema case
const ctx=initializeContext({...params,processors:allProcessors});process$1(input,ctx);extractDefs(ctx,input);return finalize(ctx,input);}

const ZodISODateTime=/*@__PURE__*/$constructor("ZodISODateTime",(inst,def)=>{$ZodISODateTime.init(inst,def);ZodStringFormat.init(inst,def);});function datetime(params){return _isoDateTime(ZodISODateTime,params);}const ZodISODate=/*@__PURE__*/$constructor("ZodISODate",(inst,def)=>{$ZodISODate.init(inst,def);ZodStringFormat.init(inst,def);});function date(params){return _isoDate(ZodISODate,params);}const ZodISOTime=/*@__PURE__*/$constructor("ZodISOTime",(inst,def)=>{$ZodISOTime.init(inst,def);ZodStringFormat.init(inst,def);});function time(params){return _isoTime(ZodISOTime,params);}const ZodISODuration=/*@__PURE__*/$constructor("ZodISODuration",(inst,def)=>{$ZodISODuration.init(inst,def);ZodStringFormat.init(inst,def);});function duration(params){return _isoDuration(ZodISODuration,params);}

const initializer=(inst,issues)=>{$ZodError.init(inst,issues);inst.name="ZodError";Object.defineProperties(inst,{format:{value:mapper=>formatError(inst,mapper)// enumerable: false,
},flatten:{value:mapper=>flattenError(inst,mapper)// enumerable: false,
},addIssue:{value:issue=>{inst.issues.push(issue);inst.message=JSON.stringify(inst.issues,jsonStringifyReplacer,2);}// enumerable: false,
},addIssues:{value:issues=>{inst.issues.push(...issues);inst.message=JSON.stringify(inst.issues,jsonStringifyReplacer,2);}// enumerable: false,
},isEmpty:{get(){return inst.issues.length===0;}// enumerable: false,
}});// Object.defineProperty(inst, "isEmpty", {
//   get() {
//     return inst.issues.length === 0;
//   },
// });
};const ZodRealError=/*@__PURE__*/$constructor("ZodError",initializer,{Parent:Error});// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

const parse=/* @__PURE__ */_parse$1(ZodRealError);const parseAsync=/* @__PURE__ */_parseAsync(ZodRealError);const safeParse=/* @__PURE__ */_safeParse(ZodRealError);const safeParseAsync=/* @__PURE__ */_safeParseAsync(ZodRealError);// Codec functions
const encode=/* @__PURE__ */_encode(ZodRealError);const decode=/* @__PURE__ */_decode(ZodRealError);const encodeAsync=/* @__PURE__ */_encodeAsync(ZodRealError);const decodeAsync=/* @__PURE__ */_decodeAsync(ZodRealError);const safeEncode=/* @__PURE__ */_safeEncode(ZodRealError);const safeDecode=/* @__PURE__ */_safeDecode(ZodRealError);const safeEncodeAsync=/* @__PURE__ */_safeEncodeAsync(ZodRealError);const safeDecodeAsync=/* @__PURE__ */_safeDecodeAsync(ZodRealError);

//
// Builder methods (`.optional`, `.array`, `.refine`, ...) live as
// non-enumerable getters on each concrete schema constructor's
// prototype. On first access from an instance the getter allocates
// `fn.bind(this)` and caches it as an own property on that instance,
// so detached usage (`const m = schema.optional; m()`) still works
// and the per-instance allocation only happens for methods actually
// touched.
//
// One install per (prototype, group), memoized by `_installedGroups`.
const _installedGroups=/* @__PURE__ */new WeakMap();function _installLazyMethods(inst,group,methods){const proto=Object.getPrototypeOf(inst);let installed=_installedGroups.get(proto);if(!installed){installed=new Set();_installedGroups.set(proto,installed);}if(installed.has(group))return;installed.add(group);for(const key in methods){const fn=methods[key];Object.defineProperty(proto,key,{configurable:true,enumerable:false,get(){const bound=fn.bind(this);Object.defineProperty(this,key,{configurable:true,writable:true,enumerable:true,value:bound});return bound;},set(v){Object.defineProperty(this,key,{configurable:true,writable:true,enumerable:true,value:v});}});}}const ZodType=/*@__PURE__*/$constructor("ZodType",(inst,def)=>{$ZodType.init(inst,def);Object.assign(inst["~standard"],{jsonSchema:{input:createStandardJSONSchemaMethod(inst,"input"),output:createStandardJSONSchemaMethod(inst,"output")}});inst.toJSONSchema=createToJSONSchemaMethod(inst,{});inst.def=def;inst.type=def.type;Object.defineProperty(inst,"_def",{value:def});// Parse-family is intentionally kept as per-instance closures: these are
// the hot path AND the most-detached methods (`arr.map(schema.parse)`,
// `const { parse } = schema`, etc.). Eager closures here mean callers pay
// ~12 closure allocations per schema but get monomorphic call sites and
// detached usage that "just works".
inst.parse=(data,params)=>parse(inst,data,params,{callee:inst.parse});inst.safeParse=(data,params)=>safeParse(inst,data,params);inst.parseAsync=async(data,params)=>parseAsync(inst,data,params,{callee:inst.parseAsync});inst.safeParseAsync=async(data,params)=>safeParseAsync(inst,data,params);inst.spa=inst.safeParseAsync;inst.encode=(data,params)=>encode(inst,data,params);inst.decode=(data,params)=>decode(inst,data,params);inst.encodeAsync=async(data,params)=>encodeAsync(inst,data,params);inst.decodeAsync=async(data,params)=>decodeAsync(inst,data,params);inst.safeEncode=(data,params)=>safeEncode(inst,data,params);inst.safeDecode=(data,params)=>safeDecode(inst,data,params);inst.safeEncodeAsync=async(data,params)=>safeEncodeAsync(inst,data,params);inst.safeDecodeAsync=async(data,params)=>safeDecodeAsync(inst,data,params);// All builder methods are placed on the internal prototype as lazy-bind
// getters. On first access per-instance, a bound thunk is allocated and
// cached as an own property; subsequent accesses skip the getter. This
// means: no per-instance allocation for unused methods, full
// detachability preserved (`const m = schema.optional; m()` works), and
// shared underlying function references across all instances.
_installLazyMethods(inst,"ZodType",{check(...chks){const def=this.def;return this.clone(mergeDefs(def,{checks:[...(def.checks??[]),...chks.map(ch=>typeof ch==="function"?{_zod:{check:ch,def:{check:"custom"},onattach:[]}}:ch)]}),{parent:true});},with(...chks){return this.check(...chks);},clone(def,params){return clone(this,def,params);},brand(){return this;},register(reg,meta){reg.add(this,meta);return this;},refine(check,params){return this.check(refine(check,params));},superRefine(refinement,params){return this.check(superRefine(refinement,params));},overwrite(fn){return this.check(_overwrite(fn));},optional(){return optional(this);},exactOptional(){return exactOptional(this);},nullable(){return nullable(this);},nullish(){return optional(nullable(this));},nonoptional(params){return nonoptional(this,params);},array(){return array(this);},or(arg){return union([this,arg]);},and(arg){return intersection(this,arg);},transform(tx){return pipe(this,transform(tx));},default(d){return _default(this,d);},prefault(d){return prefault(this,d);},catch(params){return _catch(this,params);},pipe(target){return pipe(this,target);},readonly(){return readonly(this);},describe(description){const cl=this.clone();globalRegistry.add(cl,{description});return cl;},meta(...args){// overloaded: meta() returns the registered metadata, meta(data)
// returns a clone with `data` registered. The mapped type picks
// up the second overload, so we accept variadic any-args and
// return `any` to satisfy both at runtime.
if(args.length===0)return globalRegistry.get(this);const cl=this.clone();globalRegistry.add(cl,args[0]);return cl;},isOptional(){return this.safeParse(undefined).success;},isNullable(){return this.safeParse(null).success;},apply(fn){return fn(this);}});Object.defineProperty(inst,"description",{get(){return globalRegistry.get(inst)?.description;},configurable:true});return inst;});/** @internal */const _ZodString=/*@__PURE__*/$constructor("_ZodString",(inst,def)=>{$ZodString.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>stringProcessor(inst,ctx,json);const bag=inst._zod.bag;inst.format=bag.format??null;inst.minLength=bag.minimum??null;inst.maxLength=bag.maximum??null;_installLazyMethods(inst,"_ZodString",{regex(...args){return this.check(_regex(...args));},includes(...args){return this.check(_includes(...args));},startsWith(...args){return this.check(_startsWith(...args));},endsWith(...args){return this.check(_endsWith(...args));},min(...args){return this.check(_minLength(...args));},max(...args){return this.check(_maxLength(...args));},length(...args){return this.check(_length(...args));},nonempty(...args){return this.check(_minLength(1,...args));},lowercase(params){return this.check(_lowercase(params));},uppercase(params){return this.check(_uppercase(params));},trim(){return this.check(_trim());},normalize(...args){return this.check(_normalize(...args));},toLowerCase(){return this.check(_toLowerCase());},toUpperCase(){return this.check(_toUpperCase());},slugify(){return this.check(_slugify());}});});const ZodString=/*@__PURE__*/$constructor("ZodString",(inst,def)=>{$ZodString.init(inst,def);_ZodString.init(inst,def);inst.email=params=>inst.check(_email(ZodEmail,params));inst.url=params=>inst.check(_url(ZodURL,params));inst.jwt=params=>inst.check(_jwt(ZodJWT,params));inst.emoji=params=>inst.check(_emoji(ZodEmoji,params));inst.guid=params=>inst.check(_guid(ZodGUID,params));inst.uuid=params=>inst.check(_uuid(ZodUUID,params));inst.uuidv4=params=>inst.check(_uuidv4(ZodUUID,params));inst.uuidv6=params=>inst.check(_uuidv6(ZodUUID,params));inst.uuidv7=params=>inst.check(_uuidv7(ZodUUID,params));inst.nanoid=params=>inst.check(_nanoid(ZodNanoID,params));inst.guid=params=>inst.check(_guid(ZodGUID,params));inst.cuid=params=>inst.check(_cuid(ZodCUID,params));inst.cuid2=params=>inst.check(_cuid2(ZodCUID2,params));inst.ulid=params=>inst.check(_ulid(ZodULID,params));inst.base64=params=>inst.check(_base64(ZodBase64,params));inst.base64url=params=>inst.check(_base64url(ZodBase64URL,params));inst.xid=params=>inst.check(_xid(ZodXID,params));inst.ksuid=params=>inst.check(_ksuid(ZodKSUID,params));inst.ipv4=params=>inst.check(_ipv4(ZodIPv4,params));inst.ipv6=params=>inst.check(_ipv6(ZodIPv6,params));inst.cidrv4=params=>inst.check(_cidrv4(ZodCIDRv4,params));inst.cidrv6=params=>inst.check(_cidrv6(ZodCIDRv6,params));inst.e164=params=>inst.check(_e164(ZodE164,params));// iso
inst.datetime=params=>inst.check(datetime(params));inst.date=params=>inst.check(date(params));inst.time=params=>inst.check(time(params));inst.duration=params=>inst.check(duration(params));});function string(params){return _string(ZodString,params);}const ZodStringFormat=/*@__PURE__*/$constructor("ZodStringFormat",(inst,def)=>{$ZodStringFormat.init(inst,def);_ZodString.init(inst,def);});const ZodEmail=/*@__PURE__*/$constructor("ZodEmail",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodEmail.init(inst,def);ZodStringFormat.init(inst,def);});const ZodGUID=/*@__PURE__*/$constructor("ZodGUID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodGUID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodUUID=/*@__PURE__*/$constructor("ZodUUID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodUUID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodURL=/*@__PURE__*/$constructor("ZodURL",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodURL.init(inst,def);ZodStringFormat.init(inst,def);});const ZodEmoji=/*@__PURE__*/$constructor("ZodEmoji",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodEmoji.init(inst,def);ZodStringFormat.init(inst,def);});const ZodNanoID=/*@__PURE__*/$constructor("ZodNanoID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodNanoID.init(inst,def);ZodStringFormat.init(inst,def);});/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */const ZodCUID=/*@__PURE__*/$constructor("ZodCUID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodCUID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodCUID2=/*@__PURE__*/$constructor("ZodCUID2",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodCUID2.init(inst,def);ZodStringFormat.init(inst,def);});const ZodULID=/*@__PURE__*/$constructor("ZodULID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodULID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodXID=/*@__PURE__*/$constructor("ZodXID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodXID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodKSUID=/*@__PURE__*/$constructor("ZodKSUID",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodKSUID.init(inst,def);ZodStringFormat.init(inst,def);});const ZodIPv4=/*@__PURE__*/$constructor("ZodIPv4",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodIPv4.init(inst,def);ZodStringFormat.init(inst,def);});const ZodIPv6=/*@__PURE__*/$constructor("ZodIPv6",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodIPv6.init(inst,def);ZodStringFormat.init(inst,def);});const ZodCIDRv4=/*@__PURE__*/$constructor("ZodCIDRv4",(inst,def)=>{$ZodCIDRv4.init(inst,def);ZodStringFormat.init(inst,def);});const ZodCIDRv6=/*@__PURE__*/$constructor("ZodCIDRv6",(inst,def)=>{$ZodCIDRv6.init(inst,def);ZodStringFormat.init(inst,def);});const ZodBase64=/*@__PURE__*/$constructor("ZodBase64",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodBase64.init(inst,def);ZodStringFormat.init(inst,def);});function base64(params){return _base64(ZodBase64,params);}const ZodBase64URL=/*@__PURE__*/$constructor("ZodBase64URL",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodBase64URL.init(inst,def);ZodStringFormat.init(inst,def);});const ZodE164=/*@__PURE__*/$constructor("ZodE164",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodE164.init(inst,def);ZodStringFormat.init(inst,def);});const ZodJWT=/*@__PURE__*/$constructor("ZodJWT",(inst,def)=>{// ZodStringFormat.init(inst, def);
$ZodJWT.init(inst,def);ZodStringFormat.init(inst,def);});const ZodNumber=/*@__PURE__*/$constructor("ZodNumber",(inst,def)=>{$ZodNumber.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>numberProcessor(inst,ctx,json);_installLazyMethods(inst,"ZodNumber",{gt(value,params){return this.check(_gt(value,params));},gte(value,params){return this.check(_gte(value,params));},min(value,params){return this.check(_gte(value,params));},lt(value,params){return this.check(_lt(value,params));},lte(value,params){return this.check(_lte(value,params));},max(value,params){return this.check(_lte(value,params));},int(params){return this.check(int(params));},safe(params){return this.check(int(params));},positive(params){return this.check(_gt(0,params));},nonnegative(params){return this.check(_gte(0,params));},negative(params){return this.check(_lt(0,params));},nonpositive(params){return this.check(_lte(0,params));},multipleOf(value,params){return this.check(_multipleOf(value,params));},step(value,params){return this.check(_multipleOf(value,params));},finite(){return this;}});const bag=inst._zod.bag;inst.minValue=Math.max(bag.minimum??Number.NEGATIVE_INFINITY,bag.exclusiveMinimum??Number.NEGATIVE_INFINITY)??null;inst.maxValue=Math.min(bag.maximum??Number.POSITIVE_INFINITY,bag.exclusiveMaximum??Number.POSITIVE_INFINITY)??null;inst.isInt=(bag.format??"").includes("int")||Number.isSafeInteger(bag.multipleOf??0.5);inst.isFinite=true;inst.format=bag.format??null;});function number(params){return _number(ZodNumber,params);}const ZodNumberFormat=/*@__PURE__*/$constructor("ZodNumberFormat",(inst,def)=>{$ZodNumberFormat.init(inst,def);ZodNumber.init(inst,def);});function int(params){return _int(ZodNumberFormat,params);}const ZodBoolean=/*@__PURE__*/$constructor("ZodBoolean",(inst,def)=>{$ZodBoolean.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>booleanProcessor(inst,ctx,json);});function boolean(params){return _boolean(ZodBoolean,params);}const ZodNull=/*@__PURE__*/$constructor("ZodNull",(inst,def)=>{$ZodNull.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>nullProcessor(inst,ctx,json);});function _null(params){return _null$1(ZodNull,params);}const ZodAny=/*@__PURE__*/$constructor("ZodAny",(inst,def)=>{$ZodAny.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>anyProcessor();});function any(){return _any(ZodAny);}const ZodUnknown=/*@__PURE__*/$constructor("ZodUnknown",(inst,def)=>{$ZodUnknown.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>unknownProcessor();});function unknown(){return _unknown(ZodUnknown);}const ZodNever=/*@__PURE__*/$constructor("ZodNever",(inst,def)=>{$ZodNever.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>neverProcessor(inst,ctx,json);});function never(params){return _never(ZodNever,params);}const ZodArray=/*@__PURE__*/$constructor("ZodArray",(inst,def)=>{$ZodArray.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>arrayProcessor(inst,ctx,json,params);inst.element=def.element;_installLazyMethods(inst,"ZodArray",{min(n,params){return this.check(_minLength(n,params));},nonempty(params){return this.check(_minLength(1,params));},max(n,params){return this.check(_maxLength(n,params));},length(n,params){return this.check(_length(n,params));},unwrap(){return this.element;}});});function array(element,params){return _array(ZodArray,element,params);}// .keyof
const ZodObject=/*@__PURE__*/$constructor("ZodObject",(inst,def)=>{$ZodObjectJIT.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>objectProcessor(inst,ctx,json,params);defineLazy(inst,"shape",()=>{return def.shape;});_installLazyMethods(inst,"ZodObject",{keyof(){return _enum(Object.keys(this._zod.def.shape));},catchall(catchall){return this.clone({...this._zod.def,catchall:catchall});},passthrough(){return this.clone({...this._zod.def,catchall:unknown()});},loose(){return this.clone({...this._zod.def,catchall:unknown()});},strict(){return this.clone({...this._zod.def,catchall:never()});},strip(){return this.clone({...this._zod.def,catchall:undefined});},extend(incoming){return extend(this,incoming);},safeExtend(incoming){return safeExtend(this,incoming);},merge(other){return merge(this,other);},pick(mask){return pick(this,mask);},omit(mask){return omit(this,mask);},partial(...args){return partial(ZodOptional,this,args[0]);},required(...args){return required(ZodNonOptional,this,args[0]);}});});function object(shape,params){const def={type:"object",shape:shape??{},...normalizeParams(params)};return new ZodObject(def);}// strictObject
function looseObject(shape,params){return new ZodObject({type:"object",shape,catchall:unknown(),...normalizeParams(params)});}const ZodUnion=/*@__PURE__*/$constructor("ZodUnion",(inst,def)=>{$ZodUnion.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>unionProcessor(inst,ctx,json,params);inst.options=def.options;});function union(options,params){return new ZodUnion({type:"union",options:options,...normalizeParams(params)});}const ZodDiscriminatedUnion=/*@__PURE__*/$constructor("ZodDiscriminatedUnion",(inst,def)=>{ZodUnion.init(inst,def);$ZodDiscriminatedUnion.init(inst,def);});function discriminatedUnion(discriminator,options,params){// const [options, params] = args;
return new ZodDiscriminatedUnion({type:"union",options,discriminator,...normalizeParams(params)});}const ZodIntersection=/*@__PURE__*/$constructor("ZodIntersection",(inst,def)=>{$ZodIntersection.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>intersectionProcessor(inst,ctx,json,params);});function intersection(left,right){return new ZodIntersection({type:"intersection",left:left,right:right});}const ZodRecord=/*@__PURE__*/$constructor("ZodRecord",(inst,def)=>{$ZodRecord.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>recordProcessor(inst,ctx,json,params);inst.keyType=def.keyType;inst.valueType=def.valueType;});function record(keyType,valueType,params){// v3-compat: z.record(valueType, params?) — defaults keyType to z.string()
if(!valueType||!valueType._zod){return new ZodRecord({type:"record",keyType:string(),valueType:keyType,...normalizeParams(valueType)});}return new ZodRecord({type:"record",keyType,valueType:valueType,...normalizeParams(params)});}// type alksjf = core.output<core.$ZodRecordKey>;
const ZodEnum=/*@__PURE__*/$constructor("ZodEnum",(inst,def)=>{$ZodEnum.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>enumProcessor(inst,ctx,json);inst.enum=def.entries;inst.options=Object.values(def.entries);const keys=new Set(Object.keys(def.entries));inst.extract=(values,params)=>{const newEntries={};for(const value of values){if(keys.has(value)){newEntries[value]=def.entries[value];}else throw new Error(`Key ${value} not found in enum`);}return new ZodEnum({...def,checks:[],...normalizeParams(params),entries:newEntries});};inst.exclude=(values,params)=>{const newEntries={...def.entries};for(const value of values){if(keys.has(value)){delete newEntries[value];}else throw new Error(`Key ${value} not found in enum`);}return new ZodEnum({...def,checks:[],...normalizeParams(params),entries:newEntries});};});function _enum(values,params){const entries=Array.isArray(values)?Object.fromEntries(values.map(v=>[v,v])):values;return new ZodEnum({type:"enum",entries,...normalizeParams(params)});}const ZodLiteral=/*@__PURE__*/$constructor("ZodLiteral",(inst,def)=>{$ZodLiteral.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>literalProcessor(inst,ctx,json);inst.values=new Set(def.values);Object.defineProperty(inst,"value",{get(){if(def.values.length>1){throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");}return def.values[0];}});});function literal(value,params){return new ZodLiteral({type:"literal",values:Array.isArray(value)?value:[value],...normalizeParams(params)});}const ZodTransform=/*@__PURE__*/$constructor("ZodTransform",(inst,def)=>{$ZodTransform.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>transformProcessor(inst,ctx);inst._zod.parse=(payload,_ctx)=>{if(_ctx.direction==="backward"){throw new $ZodEncodeError(inst.constructor.name);}payload.addIssue=issue$1=>{if(typeof issue$1==="string"){payload.issues.push(issue(issue$1,payload.value,def));}else {// for Zod 3 backwards compatibility
const _issue=issue$1;if(_issue.fatal)_issue.continue=false;_issue.code??(_issue.code="custom");_issue.input??(_issue.input=payload.value);_issue.inst??(_issue.inst=inst);// _issue.continue ??= true;
payload.issues.push(issue(_issue));}};const output=def.transform(payload.value,payload);if(output instanceof Promise){return output.then(output=>{payload.value=output;payload.fallback=true;return payload;});}payload.value=output;payload.fallback=true;return payload;};});function transform(fn){return new ZodTransform({type:"transform",transform:fn});}const ZodOptional=/*@__PURE__*/$constructor("ZodOptional",(inst,def)=>{$ZodOptional.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>optionalProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function optional(innerType){return new ZodOptional({type:"optional",innerType:innerType});}const ZodExactOptional=/*@__PURE__*/$constructor("ZodExactOptional",(inst,def)=>{$ZodExactOptional.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>optionalProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function exactOptional(innerType){return new ZodExactOptional({type:"optional",innerType:innerType});}const ZodNullable=/*@__PURE__*/$constructor("ZodNullable",(inst,def)=>{$ZodNullable.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>nullableProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function nullable(innerType){return new ZodNullable({type:"nullable",innerType:innerType});}// nullish
const ZodDefault=/*@__PURE__*/$constructor("ZodDefault",(inst,def)=>{$ZodDefault.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>defaultProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;inst.removeDefault=inst.unwrap;});function _default(innerType,defaultValue){return new ZodDefault({type:"default",innerType:innerType,get defaultValue(){return typeof defaultValue==="function"?defaultValue():shallowClone(defaultValue);}});}const ZodPrefault=/*@__PURE__*/$constructor("ZodPrefault",(inst,def)=>{$ZodPrefault.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>prefaultProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function prefault(innerType,defaultValue){return new ZodPrefault({type:"prefault",innerType:innerType,get defaultValue(){return typeof defaultValue==="function"?defaultValue():shallowClone(defaultValue);}});}const ZodNonOptional=/*@__PURE__*/$constructor("ZodNonOptional",(inst,def)=>{$ZodNonOptional.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>nonoptionalProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function nonoptional(innerType,params){return new ZodNonOptional({type:"nonoptional",innerType:innerType,...normalizeParams(params)});}const ZodCatch=/*@__PURE__*/$constructor("ZodCatch",(inst,def)=>{$ZodCatch.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>catchProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;inst.removeCatch=inst.unwrap;});function _catch(innerType,catchValue){return new ZodCatch({type:"catch",innerType:innerType,catchValue:typeof catchValue==="function"?catchValue:()=>catchValue});}const ZodPipe=/*@__PURE__*/$constructor("ZodPipe",(inst,def)=>{$ZodPipe.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>pipeProcessor(inst,ctx,json,params);inst.in=def.in;inst.out=def.out;});function pipe(in_,out){return new ZodPipe({type:"pipe",in:in_,out:out// ...util.normalizeParams(params),
});}const ZodPreprocess=/*@__PURE__*/$constructor("ZodPreprocess",(inst,def)=>{ZodPipe.init(inst,def);$ZodPreprocess.init(inst,def);});const ZodReadonly=/*@__PURE__*/$constructor("ZodReadonly",(inst,def)=>{$ZodReadonly.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>readonlyProcessor(inst,ctx,json,params);inst.unwrap=()=>inst._zod.def.innerType;});function readonly(innerType){return new ZodReadonly({type:"readonly",innerType:innerType});}const ZodCustom=/*@__PURE__*/$constructor("ZodCustom",(inst,def)=>{$ZodCustom.init(inst,def);ZodType.init(inst,def);inst._zod.processJSONSchema=(ctx,json,params)=>customProcessor(inst,ctx);});// custom checks
function custom(fn,_params){return _custom(ZodCustom,fn??(()=>true),_params);}function refine(fn,_params={}){return _refine(ZodCustom,fn,_params);}// superRefine
function superRefine(fn,params){return _superRefine(fn,params);}// Re-export describe and meta from core
function preprocess(fn,schema){return new ZodPreprocess({type:"pipe",in:transform(fn),out:schema});}

// Zod 3 compat layer
/** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */const ZodIssueCode={custom:"custom"};

var ZodFirstPartyTypeKind;(function(ZodFirstPartyTypeKind){ZodFirstPartyTypeKind["ZodString"]="ZodString";ZodFirstPartyTypeKind["ZodNumber"]="ZodNumber";ZodFirstPartyTypeKind["ZodNaN"]="ZodNaN";ZodFirstPartyTypeKind["ZodBigInt"]="ZodBigInt";ZodFirstPartyTypeKind["ZodBoolean"]="ZodBoolean";ZodFirstPartyTypeKind["ZodDate"]="ZodDate";ZodFirstPartyTypeKind["ZodSymbol"]="ZodSymbol";ZodFirstPartyTypeKind["ZodUndefined"]="ZodUndefined";ZodFirstPartyTypeKind["ZodNull"]="ZodNull";ZodFirstPartyTypeKind["ZodAny"]="ZodAny";ZodFirstPartyTypeKind["ZodUnknown"]="ZodUnknown";ZodFirstPartyTypeKind["ZodNever"]="ZodNever";ZodFirstPartyTypeKind["ZodVoid"]="ZodVoid";ZodFirstPartyTypeKind["ZodArray"]="ZodArray";ZodFirstPartyTypeKind["ZodObject"]="ZodObject";ZodFirstPartyTypeKind["ZodUnion"]="ZodUnion";ZodFirstPartyTypeKind["ZodDiscriminatedUnion"]="ZodDiscriminatedUnion";ZodFirstPartyTypeKind["ZodIntersection"]="ZodIntersection";ZodFirstPartyTypeKind["ZodTuple"]="ZodTuple";ZodFirstPartyTypeKind["ZodRecord"]="ZodRecord";ZodFirstPartyTypeKind["ZodMap"]="ZodMap";ZodFirstPartyTypeKind["ZodSet"]="ZodSet";ZodFirstPartyTypeKind["ZodFunction"]="ZodFunction";ZodFirstPartyTypeKind["ZodLazy"]="ZodLazy";ZodFirstPartyTypeKind["ZodLiteral"]="ZodLiteral";ZodFirstPartyTypeKind["ZodEnum"]="ZodEnum";ZodFirstPartyTypeKind["ZodEffects"]="ZodEffects";ZodFirstPartyTypeKind["ZodNativeEnum"]="ZodNativeEnum";ZodFirstPartyTypeKind["ZodOptional"]="ZodOptional";ZodFirstPartyTypeKind["ZodNullable"]="ZodNullable";ZodFirstPartyTypeKind["ZodDefault"]="ZodDefault";ZodFirstPartyTypeKind["ZodCatch"]="ZodCatch";ZodFirstPartyTypeKind["ZodPromise"]="ZodPromise";ZodFirstPartyTypeKind["ZodBranded"]="ZodBranded";ZodFirstPartyTypeKind["ZodPipeline"]="ZodPipeline";ZodFirstPartyTypeKind["ZodReadonly"]="ZodReadonly";})(ZodFirstPartyTypeKind||(ZodFirstPartyTypeKind={}));// requires TS 4.4+

class ParseError extends Error{constructor(message,options){super(message),this.name="ParseError",this.type=options.type,this.field=options.field,this.value=options.value,this.line=options.line;}}const LF=10,CR=13,SPACE=32;function noop(_arg){}function createParser(config){if(typeof config=="function")throw new TypeError("`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?");const{onEvent=noop,onError=noop,onRetry=noop,onComment,maxBufferSize}=config,pendingFragments=[];let pendingFragmentsLength=0,isFirstChunk=true,id,data="",dataLines=0,eventType,terminated=false;function feed(chunk){if(terminated)throw new Error("Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing.");if(isFirstChunk&&(isFirstChunk=false,chunk.charCodeAt(0)===239&&chunk.charCodeAt(1)===187&&chunk.charCodeAt(2)===191&&(chunk=chunk.slice(3))),pendingFragments.length===0){const trailing2=processLines(chunk);trailing2!==""&&(pendingFragments.push(trailing2),pendingFragmentsLength=trailing2.length),checkBufferSize();return;}if(chunk.indexOf(`
`)===-1&&chunk.indexOf("\r")===-1){pendingFragments.push(chunk),pendingFragmentsLength+=chunk.length,checkBufferSize();return;}pendingFragments.push(chunk);const input=pendingFragments.join("");pendingFragments.length=0,pendingFragmentsLength=0;const trailing=processLines(input);trailing!==""&&(pendingFragments.push(trailing),pendingFragmentsLength=trailing.length),checkBufferSize();}function checkBufferSize(){maxBufferSize!==void 0&&(pendingFragmentsLength+data.length<=maxBufferSize||(terminated=true,pendingFragments.length=0,pendingFragmentsLength=0,id=void 0,data="",dataLines=0,eventType=void 0,onError(new ParseError(`Buffered data exceeded max buffer size of ${maxBufferSize} characters`,{type:"max-buffer-size-exceeded"}))));}function processLines(chunk){let searchIndex=0;if(chunk.indexOf("\r")===-1){let lfIndex=chunk.indexOf(`
`,searchIndex);for(;lfIndex!==-1;){if(searchIndex===lfIndex){dataLines>0&&onEvent({id,event:eventType,data}),id=void 0,data="",dataLines=0,eventType=void 0,searchIndex=lfIndex+1,lfIndex=chunk.indexOf(`
`,searchIndex);continue;}const firstCharCode=chunk.charCodeAt(searchIndex);if(isDataPrefix(chunk,searchIndex,firstCharCode)){const valueStart=chunk.charCodeAt(searchIndex+5)===SPACE?searchIndex+6:searchIndex+5,value=chunk.slice(valueStart,lfIndex);if(dataLines===0&&chunk.charCodeAt(lfIndex+1)===LF){onEvent({id,event:eventType,data:value}),id=void 0,data="",eventType=void 0,searchIndex=lfIndex+2,lfIndex=chunk.indexOf(`
`,searchIndex);continue;}data=dataLines===0?value:`${data}
${value}`,dataLines++;}else isEventPrefix(chunk,searchIndex,firstCharCode)?eventType=chunk.slice(chunk.charCodeAt(searchIndex+6)===SPACE?searchIndex+7:searchIndex+6,lfIndex)||void 0:parseLine(chunk,searchIndex,lfIndex);searchIndex=lfIndex+1,lfIndex=chunk.indexOf(`
`,searchIndex);}return chunk.slice(searchIndex);}for(;searchIndex<chunk.length;){const crIndex=chunk.indexOf("\r",searchIndex),lfIndex=chunk.indexOf(`
`,searchIndex);let lineEnd=-1;if(crIndex!==-1&&lfIndex!==-1?lineEnd=crIndex<lfIndex?crIndex:lfIndex:crIndex!==-1?crIndex===chunk.length-1?lineEnd=-1:lineEnd=crIndex:lfIndex!==-1&&(lineEnd=lfIndex),lineEnd===-1)break;parseLine(chunk,searchIndex,lineEnd),searchIndex=lineEnd+1,chunk.charCodeAt(searchIndex-1)===CR&&chunk.charCodeAt(searchIndex)===LF&&searchIndex++;}return chunk.slice(searchIndex);}function parseLine(chunk,start,end){if(start===end){dispatchEvent();return;}const firstCharCode=chunk.charCodeAt(start);if(isDataPrefix(chunk,start,firstCharCode)){const valueStart=chunk.charCodeAt(start+5)===SPACE?start+6:start+5,value2=chunk.slice(valueStart,end);data=dataLines===0?value2:`${data}
${value2}`,dataLines++;return;}if(isEventPrefix(chunk,start,firstCharCode)){eventType=chunk.slice(chunk.charCodeAt(start+6)===SPACE?start+7:start+6,end)||void 0;return;}if(firstCharCode===105&&chunk.charCodeAt(start+1)===100&&chunk.charCodeAt(start+2)===58){const value2=chunk.slice(chunk.charCodeAt(start+3)===SPACE?start+4:start+3,end);id=value2.includes("\0")?void 0:value2;return;}if(firstCharCode===58){if(onComment){const line2=chunk.slice(start,end);onComment(line2.slice(chunk.charCodeAt(start+1)===SPACE?2:1));}return;}const line=chunk.slice(start,end),fieldSeparatorIndex=line.indexOf(":");if(fieldSeparatorIndex===-1){processField(line,"",line);return;}const field=line.slice(0,fieldSeparatorIndex),offset=line.charCodeAt(fieldSeparatorIndex+1)===SPACE?2:1,value=line.slice(fieldSeparatorIndex+offset);processField(field,value,line);}function processField(field,value,line){switch(field){case "event":eventType=value||void 0;break;case "data":data=dataLines===0?value:`${data}
${value}`,dataLines++;break;case "id":id=value.includes("\0")?void 0:value;break;case "retry":/^\d+$/.test(value)?onRetry(parseInt(value,10)):onError(new ParseError(`Invalid \`retry\` value: "${value}"`,{type:"invalid-retry",value,line}));break;default:onError(new ParseError(`Unknown field "${field.length>20?`${field.slice(0,20)}\u2026`:field}"`,{type:"unknown-field",field,value,line}));break;}}function dispatchEvent(){dataLines>0&&onEvent({id,event:eventType,data}),id=void 0,data="",dataLines=0,eventType=void 0;}function reset(options={}){if(options.consume&&pendingFragments.length>0){const incompleteLine=pendingFragments.join("");parseLine(incompleteLine,0,incompleteLine.length);}isFirstChunk=true,id=void 0,data="",dataLines=0,eventType=void 0,pendingFragments.length=0,pendingFragmentsLength=0,terminated=false;}return {feed,reset};}function isDataPrefix(chunk,i,firstCharCode){return firstCharCode===100&&chunk.charCodeAt(i+1)===97&&chunk.charCodeAt(i+2)===116&&chunk.charCodeAt(i+3)===97&&chunk.charCodeAt(i+4)===58;}function isEventPrefix(chunk,i,firstCharCode){return firstCharCode===101&&chunk.charCodeAt(i+1)===118&&chunk.charCodeAt(i+2)===101&&chunk.charCodeAt(i+3)===110&&chunk.charCodeAt(i+4)===116&&chunk.charCodeAt(i+5)===58;}

class EventSourceParserStream extends TransformStream{constructor({onError,onRetry,onComment,maxBufferSize}={}){let parser;super({start(controller){parser=createParser({onEvent:event=>{controller.enqueue(event);},onError(error){typeof onError=="function"&&onError(error),(onError==="terminate"||error.type==="max-buffer-size-exceeded")&&controller.error(error);},onRetry,onComment,maxBufferSize});},transform(chunk){parser.feed(chunk);}});}}

// src/as-array.ts
var createIdGenerator=({prefix,size=16,alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",separator="-"}={})=>{const generator=()=>{const alphabetLength=alphabet.length;const chars=new Array(size);for(let i=0;i<size;i++){chars[i]=alphabet[Math.random()*alphabetLength|0];}return chars.join("");};if(prefix==null){return generator;}if(alphabet.includes(separator)){throw new InvalidArgumentError({argument:"separator",message:`The separator "${separator}" must not be part of the alphabet "${alphabet}".`});}return ()=>`${prefix}${separator}${generator()}`;};createIdGenerator();// src/get-error-message.ts
function getRuntimeEnvironmentUserAgent(globalThisAny=globalThis){var _a2,_b2,_c;if(globalThisAny.window){return `runtime/browser`;}if((_a2=globalThisAny.navigator)==null?void 0:_a2.userAgent){return `runtime/${globalThisAny.navigator.userAgent.toLowerCase()}`;}if((_c=(_b2=globalThisAny.process)==null?void 0:_b2.versions)==null?void 0:_c.node){return `runtime/node.js/${globalThisAny.process.version.substring(0)}`;}if(globalThisAny.EdgeRuntime){return `runtime/vercel-edge`;}return "runtime/unknown";}// src/normalize-headers.ts
function normalizeHeaders(headers){if(headers==null){return {};}const normalized={};if(headers instanceof Headers){headers.forEach((value,key)=>{normalized[key.toLowerCase()]=value;});}else {if(!Array.isArray(headers)){headers=Object.entries(headers);}for(const[key,value]of headers){if(value!=null){normalized[key.toLowerCase()]=value;}}}return normalized;}// src/with-user-agent-suffix.ts
function withUserAgentSuffix(headers,...userAgentSuffixParts){const normalizedHeaders=new Headers(normalizeHeaders(headers));const currentUserAgentHeader=normalizedHeaders.get("user-agent")||"";normalizedHeaders.set("user-agent",[currentUserAgentHeader,...userAgentSuffixParts].filter(Boolean).join(" "));return Object.fromEntries(normalizedHeaders.entries());}// src/version.ts
var suspectProtoRx=/"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;var suspectConstructorRx=/"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;function _parse(text){const obj=JSON.parse(text);if(obj===null||typeof obj!=="object"){return obj;}if(suspectProtoRx.test(text)===false&&suspectConstructorRx.test(text)===false){return obj;}return filter(obj);}function filter(obj){let next=[obj];while(next.length){const nodes=next;next=[];for(const node of nodes){if(Object.prototype.hasOwnProperty.call(node,"__proto__")){throw new SyntaxError("Object contains forbidden prototype property");}if(Object.prototype.hasOwnProperty.call(node,"constructor")&&node.constructor!==null&&typeof node.constructor==="object"&&Object.prototype.hasOwnProperty.call(node.constructor,"prototype")){throw new SyntaxError("Object contains forbidden prototype property");}for(const key in node){const value=node[key];if(value&&typeof value==="object"){next.push(value);}}}}return obj;}function secureJsonParse(text){const{stackTraceLimit}=Error;try{Error.stackTraceLimit=0;}catch(e){return _parse(text);}try{return _parse(text);}finally{Error.stackTraceLimit=stackTraceLimit;}}// src/validate-types.ts
function addAdditionalPropertiesToJsonSchema(jsonSchema2){if(jsonSchema2.type==="object"||Array.isArray(jsonSchema2.type)&&jsonSchema2.type.includes("object")){jsonSchema2.additionalProperties=false;const{properties}=jsonSchema2;if(properties!=null){for(const key of Object.keys(properties)){properties[key]=visit(properties[key]);}}}if(jsonSchema2.items!=null){jsonSchema2.items=Array.isArray(jsonSchema2.items)?jsonSchema2.items.map(visit):visit(jsonSchema2.items);}if(jsonSchema2.anyOf!=null){jsonSchema2.anyOf=jsonSchema2.anyOf.map(visit);}if(jsonSchema2.allOf!=null){jsonSchema2.allOf=jsonSchema2.allOf.map(visit);}if(jsonSchema2.oneOf!=null){jsonSchema2.oneOf=jsonSchema2.oneOf.map(visit);}const{definitions}=jsonSchema2;if(definitions!=null){for(const key of Object.keys(definitions)){definitions[key]=visit(definitions[key]);}}return jsonSchema2;}function visit(def){if(typeof def==="boolean")return def;return addAdditionalPropertiesToJsonSchema(def);}// src/to-json-schema/zod3-to-json-schema/options.ts
var ignoreOverride=/* @__PURE__ */Symbol("Let zodToJsonSchema decide on which parser to use");var defaultOptions={name:void 0,$refStrategy:"root",basePath:["#"],effectStrategy:"input",pipeStrategy:"all",dateStrategy:"format:date-time",mapStrategy:"entries",removeAdditionalStrategy:"passthrough",allowedAdditionalProperties:true,rejectedAdditionalProperties:false,definitionPath:"definitions",strictUnions:false,definitions:{},errorMessages:false,patternStrategy:"escape",applyRegexFlags:false,emailStrategy:"format:email",base64Strategy:"contentEncoding:base64",nameStrategy:"ref"};var getDefaultOptions=options=>typeof options==="string"?{...defaultOptions,name:options}:{...defaultOptions,...options};// src/to-json-schema/zod3-to-json-schema/select-parser.ts
function parseAnyDef(){return {};}// src/to-json-schema/zod3-to-json-schema/parsers/array.ts
function parseArrayDef(def,refs){var _a2,_b2,_c;const res={type:"array"};if(((_a2=def.type)==null?void 0:_a2._def)&&((_c=(_b2=def.type)==null?void 0:_b2._def)==null?void 0:_c.typeName)!==ZodFirstPartyTypeKind.ZodAny){res.items=parseDef(def.type._def,{...refs,currentPath:[...refs.currentPath,"items"]});}if(def.minLength){res.minItems=def.minLength.value;}if(def.maxLength){res.maxItems=def.maxLength.value;}if(def.exactLength){res.minItems=def.exactLength.value;res.maxItems=def.exactLength.value;}return res;}// src/to-json-schema/zod3-to-json-schema/parsers/bigint.ts
function parseBigintDef(def){const res={type:"integer",format:"int64"};if(!def.checks)return res;for(const check of def.checks){switch(check.kind){case "min":if(check.inclusive){res.minimum=check.value;}else {res.exclusiveMinimum=check.value;}break;case "max":if(check.inclusive){res.maximum=check.value;}else {res.exclusiveMaximum=check.value;}break;case "multipleOf":res.multipleOf=check.value;break;}}return res;}// src/to-json-schema/zod3-to-json-schema/parsers/boolean.ts
function parseBooleanDef(){return {type:"boolean"};}// src/to-json-schema/zod3-to-json-schema/parsers/branded.ts
function parseBrandedDef(_def,refs){return parseDef(_def.type._def,refs);}// src/to-json-schema/zod3-to-json-schema/parsers/catch.ts
var parseCatchDef=(def,refs)=>{return parseDef(def.innerType._def,refs);};// src/to-json-schema/zod3-to-json-schema/parsers/date.ts
function parseDateDef(def,refs,overrideDateStrategy){const strategy=overrideDateStrategy!=null?overrideDateStrategy:refs.dateStrategy;if(Array.isArray(strategy)){return {anyOf:strategy.map(item=>parseDateDef(def,refs,item))};}switch(strategy){case "string":case "format:date-time":return {type:"string",format:"date-time"};case "format:date":return {type:"string",format:"date"};case "integer":return integerDateParser(def);}}var integerDateParser=def=>{const res={type:"integer",format:"unix-time"};for(const check of def.checks){switch(check.kind){case "min":res.minimum=check.value;break;case "max":res.maximum=check.value;break;}}return res;};// src/to-json-schema/zod3-to-json-schema/parsers/default.ts
function parseDefaultDef(_def,refs){return {...parseDef(_def.innerType._def,refs),default:_def.defaultValue()};}// src/to-json-schema/zod3-to-json-schema/parsers/effects.ts
function parseEffectsDef(_def,refs){return refs.effectStrategy==="input"?parseDef(_def.schema._def,refs):parseAnyDef();}// src/to-json-schema/zod3-to-json-schema/parsers/enum.ts
function parseEnumDef(def){return {type:"string",enum:Array.from(def.values)};}// src/to-json-schema/zod3-to-json-schema/parsers/intersection.ts
var isJsonSchema7AllOfType=type=>{if("type"in type&&type.type==="string")return false;return "allOf"in type;};function parseIntersectionDef(def,refs){const allOf=[parseDef(def.left._def,{...refs,currentPath:[...refs.currentPath,"allOf","0"]}),parseDef(def.right._def,{...refs,currentPath:[...refs.currentPath,"allOf","1"]})].filter(x=>!!x);const mergedAllOf=[];allOf.forEach(schema=>{if(isJsonSchema7AllOfType(schema)){mergedAllOf.push(...schema.allOf);}else {let nestedSchema=schema;if("additionalProperties"in schema&&schema.additionalProperties===false){const{additionalProperties:_additionalProperties,...rest}=schema;nestedSchema=rest;}mergedAllOf.push(nestedSchema);}});return mergedAllOf.length?{allOf:mergedAllOf}:void 0;}// src/to-json-schema/zod3-to-json-schema/parsers/literal.ts
function parseLiteralDef(def){const parsedType=typeof def.value;if(parsedType!=="bigint"&&parsedType!=="number"&&parsedType!=="boolean"&&parsedType!=="string"){return {type:Array.isArray(def.value)?"array":"object"};}return {type:parsedType==="bigint"?"integer":parsedType,const:def.value};}// src/to-json-schema/zod3-to-json-schema/parsers/record.ts
var emojiRegex=void 0;var zodPatterns={/**
   * `c` was changed to `[cC]` to replicate /i flag
   */cuid:/^[cC][^\s-]{8,}$/,cuid2:/^[0-9a-z]+$/,ulid:/^[0-9A-HJKMNP-TV-Z]{26}$/,/**
   * `a-z` was added to replicate /i flag
   */email:/^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,/**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */emoji:()=>{if(emojiRegex===void 0){emojiRegex=RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$","u");}return emojiRegex;},/**
   * Unused
   */uuid:/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,/**
   * Unused
   */ipv4:/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,ipv4Cidr:/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,/**
   * Unused
   */ipv6:/^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,ipv6Cidr:/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,base64:/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,base64url:/^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,nanoid:/^[a-zA-Z0-9_-]{21}$/,jwt:/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/};function parseStringDef(def,refs){const res={type:"string"};if(def.checks){for(const check of def.checks){switch(check.kind){case "min":res.minLength=typeof res.minLength==="number"?Math.max(res.minLength,check.value):check.value;break;case "max":res.maxLength=typeof res.maxLength==="number"?Math.min(res.maxLength,check.value):check.value;break;case "email":switch(refs.emailStrategy){case "format:email":addFormat(res,"email",check.message,refs);break;case "format:idn-email":addFormat(res,"idn-email",check.message,refs);break;case "pattern:zod":addPattern(res,zodPatterns.email,check.message,refs);break;}break;case "url":addFormat(res,"uri",check.message,refs);break;case "uuid":addFormat(res,"uuid",check.message,refs);break;case "regex":addPattern(res,check.regex,check.message,refs);break;case "cuid":addPattern(res,zodPatterns.cuid,check.message,refs);break;case "cuid2":addPattern(res,zodPatterns.cuid2,check.message,refs);break;case "startsWith":addPattern(res,RegExp(`^${escapeLiteralCheckValue(check.value,refs)}`),check.message,refs);break;case "endsWith":addPattern(res,RegExp(`${escapeLiteralCheckValue(check.value,refs)}$`),check.message,refs);break;case "datetime":addFormat(res,"date-time",check.message,refs);break;case "date":addFormat(res,"date",check.message,refs);break;case "time":addFormat(res,"time",check.message,refs);break;case "duration":addFormat(res,"duration",check.message,refs);break;case "length":res.minLength=typeof res.minLength==="number"?Math.max(res.minLength,check.value):check.value;res.maxLength=typeof res.maxLength==="number"?Math.min(res.maxLength,check.value):check.value;break;case "includes":{addPattern(res,RegExp(escapeLiteralCheckValue(check.value,refs)),check.message,refs);break;}case "ip":{if(check.version!=="v6"){addFormat(res,"ipv4",check.message,refs);}if(check.version!=="v4"){addFormat(res,"ipv6",check.message,refs);}break;}case "base64url":addPattern(res,zodPatterns.base64url,check.message,refs);break;case "jwt":addPattern(res,zodPatterns.jwt,check.message,refs);break;case "cidr":{if(check.version!=="v6"){addPattern(res,zodPatterns.ipv4Cidr,check.message,refs);}if(check.version!=="v4"){addPattern(res,zodPatterns.ipv6Cidr,check.message,refs);}break;}case "emoji":addPattern(res,zodPatterns.emoji(),check.message,refs);break;case "ulid":{addPattern(res,zodPatterns.ulid,check.message,refs);break;}case "base64":{switch(refs.base64Strategy){case "format:binary":{addFormat(res,"binary",check.message,refs);break;}case "contentEncoding:base64":{res.contentEncoding="base64";break;}case "pattern:zod":{addPattern(res,zodPatterns.base64,check.message,refs);break;}}break;}case "nanoid":{addPattern(res,zodPatterns.nanoid,check.message,refs);}}}}return res;}function escapeLiteralCheckValue(literal,refs){return refs.patternStrategy==="escape"?escapeNonAlphaNumeric(literal):literal;}var ALPHA_NUMERIC=new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");function escapeNonAlphaNumeric(source){let result="";for(let i=0;i<source.length;i++){if(!ALPHA_NUMERIC.has(source[i])){result+="\\";}result+=source[i];}return result;}function addFormat(schema,value,message,refs){var _a2;if(schema.format||((_a2=schema.anyOf)==null?void 0:_a2.some(x=>x.format))){if(!schema.anyOf){schema.anyOf=[];}if(schema.format){schema.anyOf.push({format:schema.format});delete schema.format;}schema.anyOf.push({format:value,...(message&&refs.errorMessages&&{errorMessage:{format:message}})});}else {schema.format=value;}}function addPattern(schema,regex,message,refs){var _a2;if(schema.pattern||((_a2=schema.allOf)==null?void 0:_a2.some(x=>x.pattern))){if(!schema.allOf){schema.allOf=[];}if(schema.pattern){schema.allOf.push({pattern:schema.pattern});delete schema.pattern;}schema.allOf.push({pattern:stringifyRegExpWithFlags(regex,refs),...(message&&refs.errorMessages&&{errorMessage:{pattern:message}})});}else {schema.pattern=stringifyRegExpWithFlags(regex,refs);}}function stringifyRegExpWithFlags(regex,refs){var _a2;if(!refs.applyRegexFlags||!regex.flags){return regex.source;}const flags={i:regex.flags.includes("i"),// Case-insensitive
m:regex.flags.includes("m"),// `^` and `$` matches adjacent to newline characters
s:regex.flags.includes("s")// `.` matches newlines
};const source=flags.i?regex.source.toLowerCase():regex.source;let pattern="";let isEscaped=false;let inCharGroup=false;let inCharRange=false;for(let i=0;i<source.length;i++){if(isEscaped){pattern+=source[i];isEscaped=false;continue;}if(flags.i){if(inCharGroup){if(source[i].match(/[a-z]/)){if(inCharRange){pattern+=source[i];pattern+=`${source[i-2]}-${source[i]}`.toUpperCase();inCharRange=false;}else if(source[i+1]==="-"&&((_a2=source[i+2])==null?void 0:_a2.match(/[a-z]/))){pattern+=source[i];inCharRange=true;}else {pattern+=`${source[i]}${source[i].toUpperCase()}`;}continue;}}else if(source[i].match(/[a-z]/)){pattern+=`[${source[i]}${source[i].toUpperCase()}]`;continue;}}if(flags.m){if(source[i]==="^"){pattern+=`(^|(?<=[\r
]))`;continue;}else if(source[i]==="$"){pattern+=`($|(?=[\r
]))`;continue;}}if(flags.s&&source[i]==="."){pattern+=inCharGroup?`${source[i]}\r
`:`[${source[i]}\r
]`;continue;}pattern+=source[i];if(source[i]==="\\"){isEscaped=true;}else if(inCharGroup&&source[i]==="]"){inCharGroup=false;}else if(!inCharGroup&&source[i]==="["){inCharGroup=true;}}try{new RegExp(pattern);}catch(e){console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);return regex.source;}return pattern;}// src/to-json-schema/zod3-to-json-schema/parsers/record.ts
function parseRecordDef(def,refs){var _a2,_b2,_c,_d,_e,_f;const schema={type:"object",additionalProperties:(_a2=parseDef(def.valueType._def,{...refs,currentPath:[...refs.currentPath,"additionalProperties"]}))!=null?_a2:refs.allowedAdditionalProperties};if(((_b2=def.keyType)==null?void 0:_b2._def.typeName)===ZodFirstPartyTypeKind.ZodString&&((_c=def.keyType._def.checks)==null?void 0:_c.length)){const{type:_type,...keyType}=parseStringDef(def.keyType._def,refs);return {...schema,propertyNames:keyType};}else if(((_d=def.keyType)==null?void 0:_d._def.typeName)===ZodFirstPartyTypeKind.ZodEnum){return {...schema,propertyNames:{enum:def.keyType._def.values}};}else if(((_e=def.keyType)==null?void 0:_e._def.typeName)===ZodFirstPartyTypeKind.ZodBranded&&def.keyType._def.type._def.typeName===ZodFirstPartyTypeKind.ZodString&&((_f=def.keyType._def.type._def.checks)==null?void 0:_f.length)){const{type:_type,...keyType}=parseBrandedDef(def.keyType._def,refs);return {...schema,propertyNames:keyType};}return schema;}// src/to-json-schema/zod3-to-json-schema/parsers/map.ts
function parseMapDef(def,refs){if(refs.mapStrategy==="record"){return parseRecordDef(def,refs);}const keys=parseDef(def.keyType._def,{...refs,currentPath:[...refs.currentPath,"items","items","0"]})||parseAnyDef();const values=parseDef(def.valueType._def,{...refs,currentPath:[...refs.currentPath,"items","items","1"]})||parseAnyDef();return {type:"array",maxItems:125,items:{type:"array",items:[keys,values],minItems:2,maxItems:2}};}// src/to-json-schema/zod3-to-json-schema/parsers/native-enum.ts
function parseNativeEnumDef(def){const object=def.values;const actualKeys=Object.keys(def.values).filter(key=>{return typeof object[object[key]]!=="number";});const actualValues=actualKeys.map(key=>object[key]);const parsedTypes=Array.from(new Set(actualValues.map(values=>typeof values)));return {type:parsedTypes.length===1?parsedTypes[0]==="string"?"string":"number":["string","number"],enum:actualValues};}// src/to-json-schema/zod3-to-json-schema/parsers/never.ts
function parseNeverDef(){return {not:parseAnyDef()};}// src/to-json-schema/zod3-to-json-schema/parsers/null.ts
function parseNullDef(){return {type:"null"};}// src/to-json-schema/zod3-to-json-schema/parsers/union.ts
var primitiveMappings={ZodString:"string",ZodNumber:"number",ZodBigInt:"integer",ZodBoolean:"boolean",ZodNull:"null"};function parseUnionDef(def,refs){const options=def.options instanceof Map?Array.from(def.options.values()):def.options;if(options.every(x=>x._def.typeName in primitiveMappings&&(!x._def.checks||!x._def.checks.length))){const types=options.reduce((types2,x)=>{const type=primitiveMappings[x._def.typeName];return type&&!types2.includes(type)?[...types2,type]:types2;},[]);return {type:types.length>1?types:types[0]};}else if(options.every(x=>x._def.typeName==="ZodLiteral"&&!x.description)){const types=options.reduce((acc,x)=>{const type=typeof x._def.value;switch(type){case "string":case "number":case "boolean":return [...acc,type];case "bigint":return [...acc,"integer"];case "object":if(x._def.value===null)return [...acc,"null"];case "symbol":case "undefined":case "function":default:return acc;}},[]);if(types.length===options.length){const uniqueTypes=types.filter((x,i,a)=>a.indexOf(x)===i);return {type:uniqueTypes.length>1?uniqueTypes:uniqueTypes[0],enum:options.reduce((acc,x)=>{return acc.includes(x._def.value)?acc:[...acc,x._def.value];},[])};}}else if(options.every(x=>x._def.typeName==="ZodEnum")){return {type:"string",enum:options.reduce((acc,x)=>[...acc,...x._def.values.filter(x2=>!acc.includes(x2))],[])};}return asAnyOf(def,refs);}var asAnyOf=(def,refs)=>{const anyOf=(def.options instanceof Map?Array.from(def.options.values()):def.options).map((x,i)=>parseDef(x._def,{...refs,currentPath:[...refs.currentPath,"anyOf",`${i}`]})).filter(x=>!!x&&(!refs.strictUnions||typeof x==="object"&&Object.keys(x).length>0));return anyOf.length?{anyOf}:void 0;};// src/to-json-schema/zod3-to-json-schema/parsers/nullable.ts
function parseNullableDef(def,refs){if(["ZodString","ZodNumber","ZodBigInt","ZodBoolean","ZodNull"].includes(def.innerType._def.typeName)&&(!def.innerType._def.checks||!def.innerType._def.checks.length)){return {type:[primitiveMappings[def.innerType._def.typeName],"null"]};}const base=parseDef(def.innerType._def,{...refs,currentPath:[...refs.currentPath,"anyOf","0"]});return base&&{anyOf:[base,{type:"null"}]};}// src/to-json-schema/zod3-to-json-schema/parsers/number.ts
function parseNumberDef(def){const res={type:"number"};if(!def.checks)return res;for(const check of def.checks){switch(check.kind){case "int":res.type="integer";break;case "min":if(check.inclusive){res.minimum=check.value;}else {res.exclusiveMinimum=check.value;}break;case "max":if(check.inclusive){res.maximum=check.value;}else {res.exclusiveMaximum=check.value;}break;case "multipleOf":res.multipleOf=check.value;break;}}return res;}// src/to-json-schema/zod3-to-json-schema/parsers/object.ts
function parseObjectDef(def,refs){const result={type:"object",properties:{}};const required=[];const shape=def.shape();for(const propName in shape){let propDef=shape[propName];if(propDef===void 0||propDef._def===void 0){continue;}const propOptional=safeIsOptional(propDef);const parsedDef=parseDef(propDef._def,{...refs,currentPath:[...refs.currentPath,"properties",propName],propertyPath:[...refs.currentPath,"properties",propName]});if(parsedDef===void 0){continue;}result.properties[propName]=parsedDef;if(!propOptional){required.push(propName);}}if(required.length){result.required=required;}const additionalProperties=decideAdditionalProperties(def,refs);if(additionalProperties!==void 0){result.additionalProperties=additionalProperties;}return result;}function decideAdditionalProperties(def,refs){if(def.catchall._def.typeName!=="ZodNever"){return parseDef(def.catchall._def,{...refs,currentPath:[...refs.currentPath,"additionalProperties"]});}switch(def.unknownKeys){case "passthrough":return refs.allowedAdditionalProperties;case "strict":return refs.rejectedAdditionalProperties;case "strip":return refs.removeAdditionalStrategy==="strict"?refs.allowedAdditionalProperties:refs.rejectedAdditionalProperties;}}function safeIsOptional(schema){try{return schema.isOptional();}catch(e){return true;}}// src/to-json-schema/zod3-to-json-schema/parsers/optional.ts
var parseOptionalDef=(def,refs)=>{var _a2;if(refs.currentPath.toString()===((_a2=refs.propertyPath)==null?void 0:_a2.toString())){return parseDef(def.innerType._def,refs);}const innerSchema=parseDef(def.innerType._def,{...refs,currentPath:[...refs.currentPath,"anyOf","1"]});return innerSchema?{anyOf:[{not:parseAnyDef()},innerSchema]}:parseAnyDef();};// src/to-json-schema/zod3-to-json-schema/parsers/pipeline.ts
var parsePipelineDef=(def,refs)=>{if(refs.pipeStrategy==="input"){return parseDef(def.in._def,refs);}else if(refs.pipeStrategy==="output"){return parseDef(def.out._def,refs);}const inputSchema=parseDef(def.in._def,{...refs,currentPath:[...refs.currentPath,"allOf","0"]});const outputSchema=parseDef(def.out._def,{...refs,currentPath:[...refs.currentPath,"allOf",inputSchema?"1":"0"]});return {allOf:[inputSchema,outputSchema].filter(schema=>schema!==void 0)};};// src/to-json-schema/zod3-to-json-schema/parsers/promise.ts
function parsePromiseDef(def,refs){return parseDef(def.type._def,refs);}// src/to-json-schema/zod3-to-json-schema/parsers/set.ts
function parseSetDef(def,refs){const items=parseDef(def.valueType._def,{...refs,currentPath:[...refs.currentPath,"items"]});const schema={type:"array",uniqueItems:true,items};if(def.minSize){schema.minItems=def.minSize.value;}if(def.maxSize){schema.maxItems=def.maxSize.value;}return schema;}// src/to-json-schema/zod3-to-json-schema/parsers/tuple.ts
function parseTupleDef(def,refs){if(def.rest){return {type:"array",minItems:def.items.length,items:def.items.map((x,i)=>parseDef(x._def,{...refs,currentPath:[...refs.currentPath,"items",`${i}`]})).reduce((acc,x)=>x===void 0?acc:[...acc,x],[]),additionalItems:parseDef(def.rest._def,{...refs,currentPath:[...refs.currentPath,"additionalItems"]})};}else {return {type:"array",minItems:def.items.length,maxItems:def.items.length,items:def.items.map((x,i)=>parseDef(x._def,{...refs,currentPath:[...refs.currentPath,"items",`${i}`]})).reduce((acc,x)=>x===void 0?acc:[...acc,x],[])};}}// src/to-json-schema/zod3-to-json-schema/parsers/undefined.ts
function parseUndefinedDef(){return {not:parseAnyDef()};}// src/to-json-schema/zod3-to-json-schema/parsers/unknown.ts
function parseUnknownDef(){return parseAnyDef();}// src/to-json-schema/zod3-to-json-schema/parsers/readonly.ts
var parseReadonlyDef=(def,refs)=>{return parseDef(def.innerType._def,refs);};// src/to-json-schema/zod3-to-json-schema/select-parser.ts
var selectParser=(def,typeName,refs)=>{switch(typeName){case ZodFirstPartyTypeKind.ZodString:return parseStringDef(def,refs);case ZodFirstPartyTypeKind.ZodNumber:return parseNumberDef(def);case ZodFirstPartyTypeKind.ZodObject:return parseObjectDef(def,refs);case ZodFirstPartyTypeKind.ZodBigInt:return parseBigintDef(def);case ZodFirstPartyTypeKind.ZodBoolean:return parseBooleanDef();case ZodFirstPartyTypeKind.ZodDate:return parseDateDef(def,refs);case ZodFirstPartyTypeKind.ZodUndefined:return parseUndefinedDef();case ZodFirstPartyTypeKind.ZodNull:return parseNullDef();case ZodFirstPartyTypeKind.ZodArray:return parseArrayDef(def,refs);case ZodFirstPartyTypeKind.ZodUnion:case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:return parseUnionDef(def,refs);case ZodFirstPartyTypeKind.ZodIntersection:return parseIntersectionDef(def,refs);case ZodFirstPartyTypeKind.ZodTuple:return parseTupleDef(def,refs);case ZodFirstPartyTypeKind.ZodRecord:return parseRecordDef(def,refs);case ZodFirstPartyTypeKind.ZodLiteral:return parseLiteralDef(def);case ZodFirstPartyTypeKind.ZodEnum:return parseEnumDef(def);case ZodFirstPartyTypeKind.ZodNativeEnum:return parseNativeEnumDef(def);case ZodFirstPartyTypeKind.ZodNullable:return parseNullableDef(def,refs);case ZodFirstPartyTypeKind.ZodOptional:return parseOptionalDef(def,refs);case ZodFirstPartyTypeKind.ZodMap:return parseMapDef(def,refs);case ZodFirstPartyTypeKind.ZodSet:return parseSetDef(def,refs);case ZodFirstPartyTypeKind.ZodLazy:return ()=>def.getter()._def;case ZodFirstPartyTypeKind.ZodPromise:return parsePromiseDef(def,refs);case ZodFirstPartyTypeKind.ZodNaN:case ZodFirstPartyTypeKind.ZodNever:return parseNeverDef();case ZodFirstPartyTypeKind.ZodEffects:return parseEffectsDef(def,refs);case ZodFirstPartyTypeKind.ZodAny:return parseAnyDef();case ZodFirstPartyTypeKind.ZodUnknown:return parseUnknownDef();case ZodFirstPartyTypeKind.ZodDefault:return parseDefaultDef(def,refs);case ZodFirstPartyTypeKind.ZodBranded:return parseBrandedDef(def,refs);case ZodFirstPartyTypeKind.ZodReadonly:return parseReadonlyDef(def,refs);case ZodFirstPartyTypeKind.ZodCatch:return parseCatchDef(def,refs);case ZodFirstPartyTypeKind.ZodPipeline:return parsePipelineDef(def,refs);case ZodFirstPartyTypeKind.ZodFunction:case ZodFirstPartyTypeKind.ZodVoid:case ZodFirstPartyTypeKind.ZodSymbol:return void 0;default:return/* @__PURE__ */(_=>void 0)();}};// src/to-json-schema/zod3-to-json-schema/get-relative-path.ts
var getRelativePath=(pathA,pathB)=>{let i=0;for(;i<pathA.length&&i<pathB.length;i++){if(pathA[i]!==pathB[i])break;}return [(pathA.length-i).toString(),...pathB.slice(i)].join("/");};// src/to-json-schema/zod3-to-json-schema/parse-def.ts
function parseDef(def,refs,forceResolution=false){var _a2;const seenItem=refs.seen.get(def);if(refs.override){const overrideResult=(_a2=refs.override)==null?void 0:_a2.call(refs,def,refs,seenItem,forceResolution);if(overrideResult!==ignoreOverride){return overrideResult;}}if(seenItem&&!forceResolution){const seenSchema=get$ref(seenItem,refs);if(seenSchema!==void 0){return seenSchema;}}const newItem={def,path:refs.currentPath,jsonSchema:void 0};refs.seen.set(def,newItem);const jsonSchemaOrGetter=selectParser(def,def.typeName,refs);const jsonSchema2=typeof jsonSchemaOrGetter==="function"?parseDef(jsonSchemaOrGetter(),refs):jsonSchemaOrGetter;if(jsonSchema2){addMeta(def,refs,jsonSchema2);}if(refs.postProcess){const postProcessResult=refs.postProcess(jsonSchema2,def,refs);newItem.jsonSchema=jsonSchema2;return postProcessResult;}newItem.jsonSchema=jsonSchema2;return jsonSchema2;}var get$ref=(item,refs)=>{switch(refs.$refStrategy){case "root":return {$ref:item.path.join("/")};case "relative":return {$ref:getRelativePath(refs.currentPath,item.path)};case "none":case "seen":{if(item.path.length<refs.currentPath.length&&item.path.every((value,index)=>refs.currentPath[index]===value)){console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);return parseAnyDef();}return refs.$refStrategy==="seen"?parseAnyDef():void 0;}}};var addMeta=(def,refs,jsonSchema2)=>{if(def.description){jsonSchema2.description=def.description;}return jsonSchema2;};// src/to-json-schema/zod3-to-json-schema/refs.ts
var getRefs=options=>{const _options=getDefaultOptions(options);const currentPath=_options.name!==void 0?[..._options.basePath,_options.definitionPath,_options.name]:_options.basePath;return {..._options,currentPath,propertyPath:void 0,seen:new Map(Object.entries(_options.definitions).map(([name2,def])=>[def._def,{def:def._def,path:[..._options.basePath,_options.definitionPath,name2],// Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
jsonSchema:void 0}]))};};// src/to-json-schema/zod3-to-json-schema/zod3-to-json-schema.ts
var zod3ToJsonSchema=(schema,options)=>{var _a2;const refs=getRefs(options);let definitions=typeof options==="object"&&options.definitions?Object.entries(options.definitions).reduce((acc,[name3,schema2])=>{var _a3;return {...acc,[name3]:(_a3=parseDef(schema2._def,{...refs,currentPath:[...refs.basePath,refs.definitionPath,name3]},true))!=null?_a3:parseAnyDef()};},{}):void 0;const name2=typeof options==="string"?options:(options==null?void 0:options.nameStrategy)==="title"?void 0:options==null?void 0:options.name;const main=(_a2=parseDef(schema._def,name2===void 0?refs:{...refs,currentPath:[...refs.basePath,refs.definitionPath,name2]},false))!=null?_a2:parseAnyDef();const title=typeof options==="object"&&options.name!==void 0&&options.nameStrategy==="title"?options.name:void 0;if(title!==void 0){main.title=title;}const combined=name2===void 0?definitions?{...main,[refs.definitionPath]:definitions}:main:{$ref:[...(refs.$refStrategy==="relative"?[]:refs.basePath),refs.definitionPath,name2].join("/"),[refs.definitionPath]:{...definitions,[name2]:main}};combined.$schema="http://json-schema.org/draft-07/schema#";return combined;};// src/schema.ts
var schemaSymbol=/* @__PURE__ */Symbol.for("vercel.ai.schema");function jsonSchema(jsonSchema2,{validate}={}){return {[schemaSymbol]:true,_type:void 0,// should never be used directly
get jsonSchema(){if(typeof jsonSchema2==="function"){jsonSchema2=jsonSchema2();}return jsonSchema2;},validate};}function isSchema(value){return typeof value==="object"&&value!==null&&schemaSymbol in value&&value[schemaSymbol]===true&&"jsonSchema"in value&&"validate"in value;}function asSchema(schema){return schema==null?jsonSchema({type:"object",properties:{},additionalProperties:false}):isSchema(schema)?schema:"~standard"in schema?schema["~standard"].vendor==="zod"?zodSchema(schema):standardSchema(schema):schema();}function standardSchema(standardSchema2){return jsonSchema(()=>addAdditionalPropertiesToJsonSchema(standardSchema2["~standard"].jsonSchema.input({target:"draft-07"})),{validate:async value=>{const result=await standardSchema2["~standard"].validate(value);return "value"in result?{success:true,value:result.value}:{success:false,error:new TypeValidationError({value,cause:result.issues})};}});}function zod3Schema(zodSchema2,options){var _a2;const useReferences=(_a2=void 0)!=null?_a2:false;return jsonSchema(// defer json schema creation to avoid unnecessary computation when only validation is needed
()=>zod3ToJsonSchema(zodSchema2,{$refStrategy:useReferences?"root":"none"}),{validate:async value=>{const result=await zodSchema2.safeParseAsync(value);return result.success?{success:true,value:result.data}:{success:false,error:result.error};}});}function zod4Schema(zodSchema2,options){var _a2;const useReferences=(_a2=void 0)!=null?_a2:false;return jsonSchema(// defer json schema creation to avoid unnecessary computation when only validation is needed
()=>addAdditionalPropertiesToJsonSchema(toJSONSchema(zodSchema2,{target:"draft-7",io:"input",reused:useReferences?"ref":"inline"})),{validate:async value=>{const result=await safeParseAsync(zodSchema2,value);return result.success?{success:true,value:result.data}:{success:false,error:result.error};}});}function isZod4Schema(zodSchema2){return "_zod"in zodSchema2;}function zodSchema(zodSchema2,options){if(isZod4Schema(zodSchema2)){return zod4Schema(zodSchema2);}else {return zod3Schema(zodSchema2);}}// src/validate-types.ts
async function validateTypes({value,schema,context}){const result=await safeValidateTypes({value,schema,context});if(!result.success){throw TypeValidationError.wrap({value,cause:result.error,context});}return result.value;}async function safeValidateTypes({value,schema,context}){const actualSchema=asSchema(schema);try{if(actualSchema.validate==null){return {success:true,value,rawValue:value};}const result=await actualSchema.validate(value);if(result.success){return {success:true,value:result.value,rawValue:value};}return {success:false,error:TypeValidationError.wrap({value,cause:result.error,context}),rawValue:value};}catch(error){return {success:false,error:TypeValidationError.wrap({value,cause:error,context}),rawValue:value};}}// src/parse-json.ts
async function parseJSON({text,schema}){try{const value=secureJsonParse(text);if(schema==null){return value;}return await validateTypes({value,schema});}catch(error){if(JSONParseError.isInstance(error)||TypeValidationError.isInstance(error)){throw error;}throw new JSONParseError({text,cause:error});}}async function safeParseJSON({text,schema}){try{const value=secureJsonParse(text);if(schema==null){return {success:true,value,rawValue:value};}return await safeValidateTypes({value,schema});}catch(error){return {success:false,error:JSONParseError.isInstance(error)?error:new JSONParseError({text,cause:error}),rawValue:void 0};}}function tool(tool2){return tool2;}function dynamicTool(tool2){return {...tool2,type:"dynamic"};}// src/provider-defined-tool-factory.ts
new TextDecoder();

let crypto;crypto=globalThis.crypto?.webcrypto??// Node.js [18-16] REPL
globalThis.crypto??// Node.js >18
import('crypto').then(m=>m.webcrypto);// Node.js <18 Non-REPL
/**
 * Creates an array of length `size` of random bytes
 * @param size
 * @returns Array of random ints (0 to 255)
 */async function getRandomValues(size){return (await crypto).getRandomValues(new Uint8Array(size));}/** Generate cryptographically strong random string
 * @param size The desired length of the string
 * @returns The random string
 */async function random(size){const mask="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";const evenDistCutoff=Math.pow(2,8)-Math.pow(2,8)%mask.length;let result="";while(result.length<size){const randomBytes=await getRandomValues(size-result.length);for(const randomByte of randomBytes){if(randomByte<evenDistCutoff){result+=mask[randomByte%mask.length];}}}return result;}/** Generate a PKCE challenge verifier
 * @param length Length of the verifier
 * @returns A random verifier `length` characters long
 */async function generateVerifier(length){return await random(length);}/** Generate a PKCE code challenge from a code verifier
 * @param code_verifier
 * @returns The base64 url encoded code challenge
 */async function generateChallenge(code_verifier){const buffer=await(await crypto).subtle.digest("SHA-256",new TextEncoder().encode(code_verifier));// Generate base64url string
// btoa is deprecated in Node.js but is used here for web browser compatibility
// (which has no good replacement yet, see also https://github.com/whatwg/html/issues/6811)
return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\//g,'_').replace(/\+/g,'-').replace(/=/g,'');}/** Generate a PKCE challenge pair
 * @param length Length of the verifer (between 43-128). Defaults to 43.
 * @returns PKCE challenge pair
 */async function pkceChallenge(length){if(!length)length=43;if(length<43||length>128){throw `Expected a length between 43 and 128. Received ${length}.`;}const verifier=await generateVerifier(length);const challenge=await generateChallenge(verifier);return {code_verifier:verifier,code_challenge:challenge};}

// src/tool/mcp-client.ts
var name="AI_MCPClientError";var marker=`vercel.ai.error.${name}`;var symbol=Symbol.for(marker);var _a,_b;var MCPClientError=class extends(_b=AISDKError,_a=symbol,_b){constructor({name:name3="MCPClientError",message,cause,data,code,statusCode,url,responseBody}){super({name:name3,message,cause});this[_a]=true;this.data=data;this.code=code;this.statusCode=statusCode;this.url=url;this.responseBody=responseBody;}static isInstance(error){return AISDKError.hasMarker(error,marker);}};// src/tool/mcp-sse-transport.ts
var LATEST_PROTOCOL_VERSION="2025-11-25";var SUPPORTED_PROTOCOL_VERSIONS=[LATEST_PROTOCOL_VERSION,"2025-06-18","2025-03-26","2024-11-05"];var ToolMetaSchema=optional(record(string(),unknown()));var ClientOrServerImplementationSchema=looseObject({name:string(),version:string(),title:optional(string())});var BaseParamsSchema=looseObject({_meta:optional(object({}).loose())});var ResultSchema$1=BaseParamsSchema;var RequestSchema$1=object({method:string(),params:optional(BaseParamsSchema)});var ElicitationCapabilitySchema$1=object({applyDefaults:optional(boolean())}).loose();var ServerCapabilitiesSchema$1=looseObject({experimental:optional(object({}).loose()),logging:optional(object({}).loose()),completions:optional(object({}).loose()),prompts:optional(looseObject({listChanged:optional(boolean())})),resources:optional(looseObject({subscribe:optional(boolean()),listChanged:optional(boolean())})),tools:optional(looseObject({listChanged:optional(boolean())})),elicitation:optional(ElicitationCapabilitySchema$1)});object({elicitation:optional(ElicitationCapabilitySchema$1)}).loose();var InitializeResultSchema$1=ResultSchema$1.extend({protocolVersion:string(),capabilities:ServerCapabilitiesSchema$1,serverInfo:ClientOrServerImplementationSchema,instructions:optional(string())});var PaginatedResultSchema$1=ResultSchema$1.extend({nextCursor:optional(string())});var ToolSchema$1=object({name:string(),/**
   * @see https://modelcontextprotocol.io/specification/2025-11-25/server/tools#tool
   */title:optional(string()),description:optional(string()),inputSchema:object({type:literal("object"),properties:optional(object({}).loose())}).loose(),/**
   * @see https://modelcontextprotocol.io/specification/2025-06-18/server/tools#output-schema
   */outputSchema:optional(object({}).loose()),annotations:optional(object({title:optional(string())}).loose()),_meta:ToolMetaSchema}).loose();var ListToolsResultSchema$1=PaginatedResultSchema$1.extend({tools:array(ToolSchema$1)});var TextContentSchema$1=object({type:literal("text"),text:string()}).loose();var ImageContentSchema$1=object({type:literal("image"),data:base64(),mimeType:string()}).loose();var ResourceSchema$1=object({uri:string(),name:string(),title:optional(string()),description:optional(string()),mimeType:optional(string()),size:optional(number())}).loose();var ListResourcesResultSchema$1=PaginatedResultSchema$1.extend({resources:array(ResourceSchema$1)});var ResourceContentsSchema$1=object({/**
   * The URI of this resource.
   */uri:string(),/**
   * Optional display name of the resource content.
   */name:optional(string()),/**
   * Optional human readable title.
   */title:optional(string()),/**
   * The MIME type of this resource, if known.
   */mimeType:optional(string())}).loose();var TextResourceContentsSchema$1=ResourceContentsSchema$1.extend({text:string()});var BlobResourceContentsSchema$1=ResourceContentsSchema$1.extend({blob:base64()});var EmbeddedResourceSchema$1=object({type:literal("resource"),resource:union([TextResourceContentsSchema$1,BlobResourceContentsSchema$1])}).loose();var ResourceLinkContentSchema=object({type:literal("resource_link"),uri:string(),name:string(),description:optional(string()),mimeType:optional(string())}).loose();var CallToolResultSchema$1=ResultSchema$1.extend({content:array(union([TextContentSchema$1,ImageContentSchema$1,EmbeddedResourceSchema$1,ResourceLinkContentSchema])),/**
   * @see https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content
   */structuredContent:optional(unknown()),isError:boolean().default(false).optional()}).or(ResultSchema$1.extend({toolResult:unknown()}));var ResourceTemplateSchema$1=object({uriTemplate:string(),name:string(),title:optional(string()),description:optional(string()),mimeType:optional(string())}).loose();var ListResourceTemplatesResultSchema$1=ResultSchema$1.extend({resourceTemplates:array(ResourceTemplateSchema$1)});var ReadResourceResultSchema$1=ResultSchema$1.extend({contents:array(union([TextResourceContentsSchema$1,BlobResourceContentsSchema$1]))});var PromptReferenceSchema$1=object({type:literal("ref/prompt"),name:string()}).loose();var ResourceReferenceSchema=object({type:literal("ref/resource"),uri:string()}).loose();var CompletionArgumentSchema=object({name:string(),value:string()}).loose();BaseParamsSchema.extend({ref:union([PromptReferenceSchema$1,ResourceReferenceSchema]),argument:CompletionArgumentSchema,context:optional(object({arguments:record(string(),string())}).loose())});var CompleteResultSchema$1=ResultSchema$1.extend({completion:object({values:array(string()).max(100),total:optional(number().int()),hasMore:optional(boolean())}).loose()});var PromptArgumentSchema$1=object({name:string(),description:optional(string()),required:optional(boolean())}).loose();var PromptSchema$1=object({name:string(),title:optional(string()),description:optional(string()),arguments:optional(array(PromptArgumentSchema$1))}).loose();var ListPromptsResultSchema$1=PaginatedResultSchema$1.extend({prompts:array(PromptSchema$1)});var PromptMessageSchema$1=object({role:union([literal("user"),literal("assistant")]),content:union([TextContentSchema$1,ImageContentSchema$1,EmbeddedResourceSchema$1,ResourceLinkContentSchema])}).loose();var GetPromptResultSchema$1=ResultSchema$1.extend({description:optional(string()),messages:array(PromptMessageSchema$1)});var ElicitationRequestParamsSchema=BaseParamsSchema.extend({message:string(),requestedSchema:unknown()});var ElicitationRequestSchema=RequestSchema$1.extend({method:literal("elicitation/create"),params:ElicitationRequestParamsSchema});var ElicitResultSchema$1=ResultSchema$1.extend({action:union([literal("accept"),literal("decline"),literal("cancel")]),content:optional(record(string(),unknown()))});// src/tool/json-rpc-message.ts
var JSONRPC_VERSION$1="2.0";var JSONRPCRequestSchema$1=object({jsonrpc:literal(JSONRPC_VERSION$1),id:union([string(),number().int()])}).merge(RequestSchema$1).strict();var JSONRPCResponseSchema=object({jsonrpc:literal(JSONRPC_VERSION$1),id:union([string(),number().int()]),result:ResultSchema$1}).strict();var JSONRPCErrorSchema=object({jsonrpc:literal(JSONRPC_VERSION$1),id:union([string(),number().int()]),error:object({code:number().int(),message:string(),data:optional(unknown())})}).strict();var JSONRPCNotificationSchema$1=object({jsonrpc:literal(JSONRPC_VERSION$1)}).merge(object({method:string(),params:optional(BaseParamsSchema)})).strict();var JSONRPCMessageSchema$1=union([JSONRPCRequestSchema$1,JSONRPCNotificationSchema$1,JSONRPCResponseSchema,JSONRPCErrorSchema]);async function parseJSONRPCMessage(text){return JSONRPCMessageSchema$1.parse(await parseJSON({text}));}// src/version.ts
var VERSION=typeof __PACKAGE_VERSION__!=="undefined"?__PACKAGE_VERSION__:"0.0.0-test";// src/tool/oauth.ts
var SafeUrlSchema=string().url().superRefine((val,ctx)=>{if(!URL.canParse(val)){ctx.addIssue({code:ZodIssueCode.custom,message:"URL must be parseable",fatal:true});return NEVER;}}).refine(url=>{const parsedUrl=new URL(url);return parsedUrl.protocol!=="javascript:"&&parsedUrl.protocol!=="data:"&&parsedUrl.protocol!=="vbscript:";},{message:"URL cannot use javascript:, data:, or vbscript: scheme"});var OAuthTokensSchema=object({access_token:string(),id_token:string().optional(),// Optional for OAuth 2.1, but necessary in OpenID Connect
token_type:string(),expires_in:number().optional(),scope:string().optional(),refresh_token:string().optional(),authorization_server:SafeUrlSchema.optional(),token_endpoint:SafeUrlSchema.optional()}).strip();var OAuthProtectedResourceMetadataSchema=looseObject({resource:string().url(),authorization_servers:array(SafeUrlSchema).optional(),jwks_uri:string().url().optional(),scopes_supported:array(string()).optional(),bearer_methods_supported:array(string()).optional(),resource_signing_alg_values_supported:array(string()).optional(),resource_name:string().optional(),resource_documentation:string().optional(),resource_policy_uri:string().url().optional(),resource_tos_uri:string().url().optional(),tls_client_certificate_bound_access_tokens:boolean().optional(),authorization_details_types_supported:array(string()).optional(),dpop_signing_alg_values_supported:array(string()).optional(),dpop_bound_access_tokens_required:boolean().optional()});var OAuthMetadataSchema=looseObject({issuer:string(),authorization_endpoint:SafeUrlSchema,token_endpoint:SafeUrlSchema,registration_endpoint:SafeUrlSchema.optional(),scopes_supported:array(string()).optional(),response_types_supported:array(string()),grant_types_supported:array(string()).optional(),code_challenge_methods_supported:array(string()),token_endpoint_auth_methods_supported:array(string()).optional(),token_endpoint_auth_signing_alg_values_supported:array(string()).optional()});var OpenIdProviderMetadataSchema=looseObject({issuer:string(),authorization_endpoint:SafeUrlSchema,token_endpoint:SafeUrlSchema,userinfo_endpoint:SafeUrlSchema.optional(),jwks_uri:SafeUrlSchema,registration_endpoint:SafeUrlSchema.optional(),scopes_supported:array(string()).optional(),response_types_supported:array(string()),grant_types_supported:array(string()).optional(),subject_types_supported:array(string()),id_token_signing_alg_values_supported:array(string()),claims_supported:array(string()).optional(),token_endpoint_auth_methods_supported:array(string()).optional()});var OpenIdProviderDiscoveryMetadataSchema=OpenIdProviderMetadataSchema.merge(OAuthMetadataSchema.pick({code_challenge_methods_supported:true}));var OAuthClientInformationSchema=object({client_id:string(),client_secret:string().optional(),client_id_issued_at:number().optional(),client_secret_expires_at:number().optional(),authorization_server:SafeUrlSchema.optional(),token_endpoint:SafeUrlSchema.optional()}).strip();var OAuthClientMetadataSchema=object({redirect_uris:array(SafeUrlSchema),token_endpoint_auth_method:string().optional(),grant_types:array(string()).optional(),response_types:array(string()).optional(),client_name:string().optional(),client_uri:SafeUrlSchema.optional(),logo_uri:SafeUrlSchema.optional(),scope:string().optional(),contacts:array(string()).optional(),tos_uri:SafeUrlSchema.optional(),policy_uri:string().optional(),jwks_uri:SafeUrlSchema.optional(),jwks:any().optional(),software_id:string().optional(),software_version:string().optional(),software_statement:string().optional()}).strip();var OAuthErrorResponseSchema=object({error:string(),error_description:string().optional(),error_uri:string().optional()});var OAuthClientInformationFullSchema=OAuthClientMetadataSchema.merge(OAuthClientInformationSchema);// src/error/oauth-error.ts
var name2="AI_MCPClientOAuthError";var marker2=`vercel.ai.error.${name2}`;var symbol2=Symbol.for(marker2);var _a2,_b2;var MCPClientOAuthError=class extends(_b2=AISDKError,_a2=symbol2,_b2){constructor({name:name3="MCPClientOAuthError",message,cause}){super({name:name3,message,cause});this[_a2]=true;}static isInstance(error){return AISDKError.hasMarker(error,marker2);}};var ServerError=class extends MCPClientOAuthError{};ServerError.errorCode="server_error";var InvalidClientError=class extends MCPClientOAuthError{};InvalidClientError.errorCode="invalid_client";var InvalidGrantError=class extends MCPClientOAuthError{};InvalidGrantError.errorCode="invalid_grant";var UnauthorizedClientError=class extends MCPClientOAuthError{};UnauthorizedClientError.errorCode="unauthorized_client";var OAUTH_ERRORS={[ServerError.errorCode]:ServerError,[InvalidClientError.errorCode]:InvalidClientError,[InvalidGrantError.errorCode]:InvalidGrantError,[UnauthorizedClientError.errorCode]:UnauthorizedClientError};// src/util/oauth-util.ts
function resourceUrlFromServerUrl(url){const resourceURL=typeof url==="string"?new URL(url):new URL(url.href);resourceURL.hash="";return resourceURL;}function resourceUrlStripSlash(resource){const href=resource.href;if(resource.pathname==="/"&&href.endsWith("/")){return href.slice(0,-1);}return href;}function checkResourceAllowed({requestedResource,configuredResource}){const requested=typeof requestedResource==="string"?new URL(requestedResource):new URL(requestedResource.href);const configured=typeof configuredResource==="string"?new URL(configuredResource):new URL(configuredResource.href);if(requested.origin!==configured.origin){return false;}if(requested.pathname.length<configured.pathname.length){return false;}const requestedPath=requested.pathname.endsWith("/")?requested.pathname:requested.pathname+"/";const configuredPath=configured.pathname.endsWith("/")?configured.pathname:configured.pathname+"/";return requestedPath.startsWith(configuredPath);}// src/tool/oauth.ts
var UnauthorizedError=class extends Error{constructor(message="Unauthorized"){super(message);this.name="UnauthorizedError";}};function normalizeUrl(url){return new URL(url).href;}function createAuthorizationServerInformation(authorizationServerUrl,metadata){return {authorizationServerUrl:normalizeUrl(authorizationServerUrl),tokenEndpoint:normalizeUrl((metadata==null?void 0:metadata.token_endpoint)?new URL(metadata.token_endpoint):new URL("/token",authorizationServerUrl))};}function addAuthorizationServerInformationToTokens(tokens,authorizationServerInformation){return {...tokens,authorization_server:authorizationServerInformation.authorizationServerUrl,token_endpoint:authorizationServerInformation.tokenEndpoint};}function addAuthorizationServerInformationToClientInformation(clientInformation,authorizationServerInformation){return {...clientInformation,authorization_server:authorizationServerInformation.authorizationServerUrl,token_endpoint:authorizationServerInformation.tokenEndpoint};}function getAuthorizationServerInformationFromCredentials(credentials){if(!(credentials==null?void 0:credentials.authorization_server)||!credentials.token_endpoint){return void 0;}return {authorizationServerUrl:normalizeUrl(credentials.authorization_server),tokenEndpoint:normalizeUrl(credentials.token_endpoint)};}async function getStoredAuthorizationServerInformation({provider,clientInformation,tokens}){var _a3;const tokenAuthorizationServerInformation=getAuthorizationServerInformationFromCredentials(tokens);if(tokenAuthorizationServerInformation){return tokenAuthorizationServerInformation;}const providerAuthorizationServerInformation=await((_a3=provider.authorizationServerInformation)==null?void 0:_a3.call(provider));if(providerAuthorizationServerInformation){return {authorizationServerUrl:normalizeUrl(providerAuthorizationServerInformation.authorizationServerUrl),tokenEndpoint:normalizeUrl(providerAuthorizationServerInformation.tokenEndpoint)};}return getAuthorizationServerInformationFromCredentials(clientInformation);}async function saveAuthorizationServerInformation({provider,clientInformation,authorizationServerInformation}){if(provider.saveAuthorizationServerInformation){await provider.saveAuthorizationServerInformation(authorizationServerInformation);return true;}if(provider.saveClientInformation){await provider.saveClientInformation(addAuthorizationServerInformationToClientInformation(clientInformation,authorizationServerInformation));return true;}return false;}function assertResourceMetadataUrlSameOrigin(serverUrl,resourceMetadataUrl){if(!resourceMetadataUrl){return;}const expectedOrigin=new URL(serverUrl).origin;if(resourceMetadataUrl.origin!==expectedOrigin){throw new MCPClientOAuthError({message:`OAuth protected resource metadata URL ${resourceMetadataUrl.href} must have the same origin as the MCP server URL ${expectedOrigin}`});}}function assertAuthorizationServerInformationMatches({storedAuthorizationServerInformation,currentAuthorizationServerInformation}){if(storedAuthorizationServerInformation.authorizationServerUrl!==currentAuthorizationServerInformation.authorizationServerUrl||storedAuthorizationServerInformation.tokenEndpoint!==currentAuthorizationServerInformation.tokenEndpoint){throw new MCPClientOAuthError({message:"OAuth authorization server metadata does not match the metadata that issued the stored credentials"});}}function extractResourceMetadataUrl(response){var _a3;const header=(_a3=response.headers.get("www-authenticate"))!=null?_a3:response.headers.get("WWW-Authenticate");if(!header){return void 0;}const[type,scheme]=header.split(" ");if(type.toLowerCase()!=="bearer"||!scheme){return void 0;}const regex=/resource_metadata="([^"]*)"/;const match=header.match(regex);if(!match){return void 0;}try{return new URL(match[1]);}catch(e){return void 0;}}function buildWellKnownPath(wellKnownPrefix,pathname="",options={}){if(pathname.endsWith("/")){pathname=pathname.slice(0,-1);}return options.prependPathname?`${pathname}/.well-known/${wellKnownPrefix}`:`/.well-known/${wellKnownPrefix}${pathname}`;}async function fetchWithCorsRetry(url,headers,fetchFn=fetch){try{return await fetchFn(url,{headers});}catch(error){if(error instanceof TypeError){if(headers){return fetchWithCorsRetry(url,void 0,fetchFn);}else {return void 0;}}throw error;}}async function tryMetadataDiscovery(url,protocolVersion,fetchFn=fetch){const headers={"MCP-Protocol-Version":protocolVersion};return await fetchWithCorsRetry(url,headers,fetchFn);}function shouldAttemptFallback(response,pathname){return !response||response.status>=400&&response.status<500&&pathname!=="/";}async function discoverMetadataWithFallback(serverUrl,wellKnownType,fetchFn,opts){var _a3,_b3;const issuer=new URL(serverUrl);const protocolVersion=(_a3=opts==null?void 0:opts.protocolVersion)!=null?_a3:LATEST_PROTOCOL_VERSION;let url;if(opts==null?void 0:opts.metadataUrl){url=new URL(opts.metadataUrl);}else {const wellKnownPath=buildWellKnownPath(wellKnownType,issuer.pathname);url=new URL(wellKnownPath,(_b3=opts==null?void 0:opts.metadataServerUrl)!=null?_b3:issuer);url.search=issuer.search;}let response=await tryMetadataDiscovery(url,protocolVersion,fetchFn);if(!(opts==null?void 0:opts.metadataUrl)&&shouldAttemptFallback(response,issuer.pathname)){const rootUrl=new URL(`/.well-known/${wellKnownType}`,issuer);response=await tryMetadataDiscovery(rootUrl,protocolVersion,fetchFn);}return response;}async function discoverOAuthProtectedResourceMetadata(serverUrl,opts,fetchFn=fetch){const response=await discoverMetadataWithFallback(serverUrl,"oauth-protected-resource",fetchFn,{protocolVersion:opts==null?void 0:opts.protocolVersion,metadataUrl:opts==null?void 0:opts.resourceMetadataUrl});if(!response||response.status===404){throw new Error(`Resource server does not implement OAuth 2.0 Protected Resource Metadata.`);}if(!response.ok){throw new Error(`HTTP ${response.status} trying to load well-known OAuth protected resource metadata.`);}return OAuthProtectedResourceMetadataSchema.parse(await response.json());}function buildDiscoveryUrls(authorizationServerUrl){const url=typeof authorizationServerUrl==="string"?new URL(authorizationServerUrl):authorizationServerUrl;const hasPath=url.pathname!=="/";const rootIssuer=url.origin;const urlsToTry=[];if(!hasPath){urlsToTry.push({url:new URL("/.well-known/oauth-authorization-server",url.origin),type:"oauth",expectedIssuer:rootIssuer});urlsToTry.push({url:new URL("/.well-known/openid-configuration",url.origin),type:"oidc",expectedIssuer:rootIssuer});return urlsToTry;}let pathname=url.pathname;if(pathname.endsWith("/")){pathname=pathname.slice(0,-1);}const pathIssuer=`${url.origin}${pathname}`;urlsToTry.push({url:new URL(`/.well-known/oauth-authorization-server${pathname}`,url.origin),type:"oauth",expectedIssuer:pathIssuer});urlsToTry.push({url:new URL("/.well-known/oauth-authorization-server",url.origin),type:"oauth",expectedIssuer:rootIssuer});urlsToTry.push({url:new URL(`/.well-known/openid-configuration${pathname}`,url.origin),type:"oidc",expectedIssuer:pathIssuer});urlsToTry.push({url:new URL(`${pathname}/.well-known/openid-configuration`,url.origin),type:"oidc",expectedIssuer:pathIssuer});return urlsToTry;}function assertMetadataIssuerMatches(metadata,expectedIssuer){if(metadata.issuer!==expectedIssuer){throw new MCPClientOAuthError({message:`OAuth authorization server metadata issuer ${metadata.issuer} does not match expected issuer ${expectedIssuer}`});}}async function discoverAuthorizationServerMetadata(authorizationServerUrl,{fetchFn=fetch,protocolVersion=LATEST_PROTOCOL_VERSION}={}){var _a3;const headers={"MCP-Protocol-Version":protocolVersion};const urlsToTry=buildDiscoveryUrls(authorizationServerUrl);for(const{url:endpointUrl,type,expectedIssuer}of urlsToTry){const response=await fetchWithCorsRetry(endpointUrl,headers,fetchFn);if(!response){continue;}if(!response.ok){if(response.status>=400&&response.status<500){continue;}throw new Error(`HTTP ${response.status} trying to load ${type==="oauth"?"OAuth":"OpenID provider"} metadata from ${endpointUrl}`);}if(type==="oauth"){const metadata=OAuthMetadataSchema.parse(await response.json());assertMetadataIssuerMatches(metadata,expectedIssuer);return metadata;}else {const metadata=OpenIdProviderDiscoveryMetadataSchema.parse(await response.json());assertMetadataIssuerMatches(metadata,expectedIssuer);if(!((_a3=metadata.code_challenge_methods_supported)==null?void 0:_a3.includes("S256"))){throw new Error(`Incompatible OIDC provider at ${endpointUrl}: does not support S256 code challenge method required by MCP specification`);}return metadata;}}return void 0;}async function startAuthorization(authorizationServerUrl,{metadata,clientInformation,redirectUrl,scope,state,resource}){const responseType="code";const codeChallengeMethod="S256";let authorizationUrl;if(metadata){authorizationUrl=new URL(metadata.authorization_endpoint);if(!metadata.response_types_supported.includes(responseType)){throw new Error(`Incompatible auth server: does not support response type ${responseType}`);}if(!metadata.code_challenge_methods_supported||!metadata.code_challenge_methods_supported.includes(codeChallengeMethod)){throw new Error(`Incompatible auth server: does not support code challenge method ${codeChallengeMethod}`);}}else {authorizationUrl=new URL("/authorize",authorizationServerUrl);}const challenge=await pkceChallenge();const codeVerifier=challenge.code_verifier;const codeChallenge=challenge.code_challenge;authorizationUrl.searchParams.set("response_type",responseType);authorizationUrl.searchParams.set("client_id",clientInformation.client_id);authorizationUrl.searchParams.set("code_challenge",codeChallenge);authorizationUrl.searchParams.set("code_challenge_method",codeChallengeMethod);authorizationUrl.searchParams.set("redirect_uri",String(redirectUrl));if(state){authorizationUrl.searchParams.set("state",state);}if(scope){authorizationUrl.searchParams.set("scope",scope);}if(scope==null?void 0:scope.includes("offline_access")){authorizationUrl.searchParams.append("prompt","consent");}if(resource){authorizationUrl.searchParams.set("resource",resourceUrlStripSlash(resource));}return {authorizationUrl,codeVerifier};}function selectClientAuthMethod(clientInformation,supportedMethods){const hasClientSecret=clientInformation.client_secret!==void 0;if(supportedMethods.length===0){return hasClientSecret?"client_secret_post":"none";}if(hasClientSecret&&supportedMethods.includes("client_secret_basic")){return "client_secret_basic";}if(hasClientSecret&&supportedMethods.includes("client_secret_post")){return "client_secret_post";}if(supportedMethods.includes("none")){return "none";}return hasClientSecret?"client_secret_post":"none";}function applyClientAuthentication(method,clientInformation,headers,params){const{client_id,client_secret}=clientInformation;switch(method){case "client_secret_basic":applyBasicAuth(client_id,client_secret,headers);return;case "client_secret_post":applyPostAuth(client_id,client_secret,params);return;case "none":applyPublicAuth(client_id,params);return;default:throw new Error(`Unsupported client authentication method: ${method}`);}}function applyBasicAuth(clientId,clientSecret,headers){if(!clientSecret){throw new Error("client_secret_basic authentication requires a client_secret");}const credentials=btoa(`${clientId}:${clientSecret}`);headers.set("Authorization",`Basic ${credentials}`);}function applyPostAuth(clientId,clientSecret,params){params.set("client_id",clientId);if(clientSecret){params.set("client_secret",clientSecret);}}function applyPublicAuth(clientId,params){params.set("client_id",clientId);}async function parseErrorResponse(input){const statusCode=input instanceof Response?input.status:void 0;const body=input instanceof Response?await input.text():input;try{const result=OAuthErrorResponseSchema.parse(await parseJSON({text:body}));const{error,error_description,error_uri}=result;const errorClass=OAUTH_ERRORS[error]||ServerError;return new errorClass({message:error_description||"",cause:error_uri});}catch(error){const errorMessage=`${statusCode?`HTTP ${statusCode}: `:""}Invalid OAuth error response: ${error}. Raw body: ${body}`;return new ServerError({message:errorMessage});}}async function exchangeAuthorization(authorizationServerUrl,{metadata,clientInformation,authorizationCode,codeVerifier,redirectUri,resource,addClientAuthentication,fetchFn}){var _a3;const grantType="authorization_code";const tokenUrl=(metadata==null?void 0:metadata.token_endpoint)?new URL(metadata.token_endpoint):new URL("/token",authorizationServerUrl);if((metadata==null?void 0:metadata.grant_types_supported)&&!metadata.grant_types_supported.includes(grantType)){throw new Error(`Incompatible auth server: does not support grant type ${grantType}`);}const headers=new Headers({"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"});const params=new URLSearchParams({grant_type:grantType,code:authorizationCode,code_verifier:codeVerifier,redirect_uri:String(redirectUri)});if(addClientAuthentication){await addClientAuthentication(headers,params,authorizationServerUrl,metadata);}else {const supportedMethods=(_a3=metadata==null?void 0:metadata.token_endpoint_auth_methods_supported)!=null?_a3:[];const authMethod=selectClientAuthMethod(clientInformation,supportedMethods);applyClientAuthentication(authMethod,clientInformation,headers,params);}if(resource){params.set("resource",resourceUrlStripSlash(resource));}const response=await(fetchFn!=null?fetchFn:fetch)(tokenUrl,{method:"POST",headers,body:params});if(!response.ok){throw await parseErrorResponse(response);}return OAuthTokensSchema.parse(await response.json());}async function refreshAuthorization(authorizationServerUrl,{metadata,clientInformation,refreshToken,resource,addClientAuthentication,fetchFn}){var _a3;const grantType="refresh_token";let tokenUrl;if(metadata){tokenUrl=new URL(metadata.token_endpoint);if(metadata.grant_types_supported&&!metadata.grant_types_supported.includes(grantType)){throw new Error(`Incompatible auth server: does not support grant type ${grantType}`);}}else {tokenUrl=new URL("/token",authorizationServerUrl);}const headers=new Headers({"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json"});const params=new URLSearchParams({grant_type:grantType,refresh_token:refreshToken});if(addClientAuthentication){await addClientAuthentication(headers,params,authorizationServerUrl,metadata);}else {const supportedMethods=(_a3=metadata==null?void 0:metadata.token_endpoint_auth_methods_supported)!=null?_a3:[];const authMethod=selectClientAuthMethod(clientInformation,supportedMethods);applyClientAuthentication(authMethod,clientInformation,headers,params);}if(resource){params.set("resource",resourceUrlStripSlash(resource));}const response=await(fetchFn!=null?fetchFn:fetch)(tokenUrl,{method:"POST",headers,body:params});if(!response.ok){throw await parseErrorResponse(response);}return OAuthTokensSchema.parse({refresh_token:refreshToken,...(await response.json())});}async function registerClient(authorizationServerUrl,{metadata,clientMetadata,fetchFn}){let registrationUrl;if(metadata){if(!metadata.registration_endpoint){throw new Error("Incompatible auth server: does not support dynamic client registration");}registrationUrl=new URL(metadata.registration_endpoint);}else {registrationUrl=new URL("/register",authorizationServerUrl);}const response=await(fetchFn!=null?fetchFn:fetch)(registrationUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(clientMetadata)});if(!response.ok){throw await parseErrorResponse(response);}return OAuthClientInformationFullSchema.parse(await response.json());}async function auth(provider,options){var _a3,_b3;try{return await authInternal(provider,options);}catch(error){if(error instanceof InvalidClientError||error instanceof UnauthorizedClientError){await((_a3=provider.invalidateCredentials)==null?void 0:_a3.call(provider,"all"));return await authInternal(provider,options);}else if(error instanceof InvalidGrantError){await((_b3=provider.invalidateCredentials)==null?void 0:_b3.call(provider,"tokens"));return await authInternal(provider,options);}throw error;}}async function selectResourceURL(serverUrl,provider,resourceMetadata){const defaultResource=resourceUrlFromServerUrl(serverUrl);if(provider.validateResourceURL){return await provider.validateResourceURL(defaultResource,resourceMetadata==null?void 0:resourceMetadata.resource);}if(!resourceMetadata){return void 0;}if(!checkResourceAllowed({requestedResource:defaultResource,configuredResource:resourceMetadata.resource})){throw new Error(`Protected resource ${resourceMetadata.resource} does not match expected ${defaultResource} (or origin)`);}return new URL(resourceMetadata.resource);}async function authInternal(provider,{serverUrl,authorizationCode,callbackState,scope,resourceMetadataUrl,fetchFn}){var _a3,_b3;let resourceMetadata;let authorizationServerUrl;assertResourceMetadataUrlSameOrigin(serverUrl,resourceMetadataUrl);try{resourceMetadata=await discoverOAuthProtectedResourceMetadata(serverUrl,{resourceMetadataUrl},fetchFn);if(resourceMetadata.authorization_servers&&resourceMetadata.authorization_servers.length>0){authorizationServerUrl=resourceMetadata.authorization_servers[0];}}catch(e){}if(!authorizationServerUrl){authorizationServerUrl=serverUrl;}const resource=await selectResourceURL(serverUrl,provider,resourceMetadata);await((_a3=provider.validateAuthorizationServerURL)==null?void 0:_a3.call(provider,serverUrl,authorizationServerUrl));const metadata=await discoverAuthorizationServerMetadata(authorizationServerUrl,{fetchFn});const currentAuthorizationServerInformation=createAuthorizationServerInformation(authorizationServerUrl,metadata);let clientInformation=await Promise.resolve(provider.clientInformation());if(!clientInformation){if(authorizationCode!==void 0){throw new Error("Existing OAuth client information is required when exchanging an authorization code");}if(!provider.saveClientInformation){throw new Error("OAuth client information must be saveable for dynamic registration");}const fullInformation=await registerClient(authorizationServerUrl,{metadata,clientMetadata:provider.clientMetadata,fetchFn});clientInformation=addAuthorizationServerInformationToClientInformation(fullInformation,currentAuthorizationServerInformation);await provider.saveClientInformation(clientInformation);}if(authorizationCode!==void 0){if(provider.storedState){const expectedState=await provider.storedState();if(expectedState!==void 0&&expectedState!==callbackState){throw new Error("OAuth state parameter mismatch - possible CSRF attack");}}const storedAuthorizationServerInformation=await getStoredAuthorizationServerInformation({provider,clientInformation});if(!storedAuthorizationServerInformation){throw new MCPClientOAuthError({message:"Stored OAuth authorization server metadata is required when exchanging an authorization code"});}assertAuthorizationServerInformationMatches({storedAuthorizationServerInformation,currentAuthorizationServerInformation});const codeVerifier2=await provider.codeVerifier();const tokens2=await exchangeAuthorization(authorizationServerUrl,{metadata,clientInformation,authorizationCode,codeVerifier:codeVerifier2,redirectUri:provider.redirectUrl,resource,addClientAuthentication:provider.addClientAuthentication,fetchFn});await provider.saveTokens(addAuthorizationServerInformationToTokens(tokens2,currentAuthorizationServerInformation));return "AUTHORIZED";}const tokens=await provider.tokens();if(tokens==null?void 0:tokens.refresh_token){const storedAuthorizationServerInformation=await getStoredAuthorizationServerInformation({provider,clientInformation,tokens});if(storedAuthorizationServerInformation){assertAuthorizationServerInformationMatches({storedAuthorizationServerInformation,currentAuthorizationServerInformation});}else {await((_b3=provider.invalidateCredentials)==null?void 0:_b3.call(provider,"tokens"));}try{if(storedAuthorizationServerInformation){const newTokens=await refreshAuthorization(authorizationServerUrl,{metadata,clientInformation,refreshToken:tokens.refresh_token,resource,addClientAuthentication:provider.addClientAuthentication,fetchFn});await provider.saveTokens(addAuthorizationServerInformationToTokens(newTokens,currentAuthorizationServerInformation));return "AUTHORIZED";}}catch(error){if(// If this is a ServerError, or an unknown type, log it out and try to continue. Otherwise, escalate so we can fix things and retry.
!(error instanceof MCPClientOAuthError)||error instanceof ServerError);else {throw error;}}}const state=provider.state?await provider.state():void 0;if(state&&provider.saveState){await provider.saveState(state);}const{authorizationUrl,codeVerifier}=await startAuthorization(authorizationServerUrl,{metadata,clientInformation,state,redirectUrl:provider.redirectUrl,scope:scope||provider.clientMetadata.scope,resource});const savedAuthorizationServerInformation=await saveAuthorizationServerInformation({provider,clientInformation,authorizationServerInformation:currentAuthorizationServerInformation});if(!savedAuthorizationServerInformation){throw new MCPClientOAuthError({message:"OAuth authorization server metadata must be saveable before starting authorization"});}await provider.saveCodeVerifier(codeVerifier);await provider.redirectToAuthorization(authorizationUrl);return "REDIRECT";}// src/tool/mcp-sse-transport.ts
function isMessageEvent(event){return event===void 0||event==="message";}var SseMCPTransport=class{constructor({url,headers,authProvider,redirect="error",fetch:fetchFn}){this.connected=false;this.url=new URL(url);this.headers=headers;this.authProvider=authProvider;this.redirectMode=redirect;this.fetchFn=fetchFn!=null?fetchFn:globalThis.fetch;}setProtocolVersion(version){this.protocolVersion=version;}async commonHeaders(base){var _a3;const headers={...this.headers,...base,"mcp-protocol-version":(_a3=this.protocolVersion)!=null?_a3:LATEST_PROTOCOL_VERSION};if(this.authProvider){const tokens=await this.authProvider.tokens();if(tokens==null?void 0:tokens.access_token){headers["Authorization"]=`Bearer ${tokens.access_token}`;}}return withUserAgentSuffix(headers,`ai-sdk/${VERSION}`,getRuntimeEnvironmentUserAgent());}async start(){return new Promise((resolve,reject)=>{if(this.connected){return resolve();}this.abortController=new AbortController();const establishConnection=async(triedAuth=false)=>{var _a3,_b3,_c,_d,_e;try{const headers=await this.commonHeaders({Accept:"text/event-stream"});const response=await this.fetchFn(this.url.href,{headers,signal:(_a3=this.abortController)==null?void 0:_a3.signal,redirect:this.redirectMode});if(response.status===401&&this.authProvider&&!triedAuth){this.resourceMetadataUrl=extractResourceMetadataUrl(response);try{const result=await auth(this.authProvider,{serverUrl:this.url,resourceMetadataUrl:this.resourceMetadataUrl,fetchFn:this.fetchFn});if(result!=="AUTHORIZED"){const error=new UnauthorizedError();(_b3=this.onerror)==null?void 0:_b3.call(this,error);return reject(error);}}catch(error){(_c=this.onerror)==null?void 0:_c.call(this,error);return reject(error);}return establishConnection(true);}if(!response.ok||!response.body){let errorMessage=`MCP SSE Transport Error: ${response.status} ${response.statusText}`;if(response.status===405){errorMessage+=". This server does not support SSE transport. Try using `http` transport instead";}const error=new MCPClientError({message:errorMessage});(_d=this.onerror)==null?void 0:_d.call(this,error);return reject(error);}const stream=response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());const reader=stream.getReader();const processEvents=async()=>{var _a4,_b4,_c2,_d2,_e2;try{while(true){const{done,value}=await reader.read();if(done){if(this.connected){this.connected=false;throw new MCPClientError({message:"MCP SSE Transport Error: Connection closed unexpectedly"});}return;}const{event,data}=value;if(event==="endpoint"){if(this.endpoint){continue;}const endpoint=new URL(data,this.url);if(endpoint.origin!==this.url.origin){this.connected=false;this.endpoint=void 0;(_a4=this.sseConnection)==null?void 0:_a4.close();(_b4=this.abortController)==null?void 0:_b4.abort();throw new MCPClientError({message:`MCP SSE Transport Error: Endpoint origin does not match connection origin: ${endpoint.origin}`});}this.endpoint=endpoint;this.connected=true;resolve();}else if(isMessageEvent(event)){try{const message=await parseJSONRPCMessage(data);(_c2=this.onmessage)==null?void 0:_c2.call(this,message);}catch(error){const e=new MCPClientError({message:"MCP SSE Transport Error: Failed to parse message",cause:error});(_d2=this.onerror)==null?void 0:_d2.call(this,e);}}}}catch(error){if(error instanceof Error&&error.name==="AbortError"){return;}(_e2=this.onerror)==null?void 0:_e2.call(this,error);reject(error);}};this.sseConnection={close:()=>reader.cancel()};processEvents();}catch(error){if(error instanceof Error&&error.name==="AbortError"){return;}(_e=this.onerror)==null?void 0:_e.call(this,error);reject(error);}};void establishConnection();});}async close(){var _a3,_b3,_c;this.connected=false;this.endpoint=void 0;(_a3=this.sseConnection)==null?void 0:_a3.close();(_b3=this.abortController)==null?void 0:_b3.abort();(_c=this.onclose)==null?void 0:_c.call(this);}async send(message){if(!this.endpoint||!this.connected){throw new MCPClientError({message:"MCP SSE Transport Error: Not connected"});}const endpoint=this.endpoint;const attempt=async(triedAuth=false)=>{var _a3,_b3,_c,_d,_e;try{const headers=await this.commonHeaders({"Content-Type":"application/json"});const init={method:"POST",headers,body:JSON.stringify(message),signal:(_a3=this.abortController)==null?void 0:_a3.signal,redirect:this.redirectMode};const response=await this.fetchFn(endpoint.href,init);if(response.status===401&&this.authProvider&&!triedAuth){this.resourceMetadataUrl=extractResourceMetadataUrl(response);try{const result=await auth(this.authProvider,{serverUrl:this.url,resourceMetadataUrl:this.resourceMetadataUrl,fetchFn:this.fetchFn});if(result!=="AUTHORIZED"){const error=new UnauthorizedError();(_b3=this.onerror)==null?void 0:_b3.call(this,error);return;}}catch(error){(_c=this.onerror)==null?void 0:_c.call(this,error);return;}return attempt(true);}if(!response.ok){const text=await response.text().catch(()=>null);const error=new MCPClientError({message:`MCP SSE Transport Error: POSTing to endpoint (HTTP ${response.status}): ${text}`});(_d=this.onerror)==null?void 0:_d.call(this,error);return;}}catch(error){(_e=this.onerror)==null?void 0:_e.call(this,error);return;}};await attempt();}};// src/tool/mcp-http-transport.ts
function isMessageEvent2(event){return event===void 0||event==="message";}var HttpMCPTransport=class{constructor({url,headers,authProvider,redirect="error",initialSessionId,initialProtocolVersion,onSessionIdChange,onSessionExpired,terminateSessionOnClose=true,fetch:fetchFn}){this.inboundReconnectAttempts=0;this.reconnectionOptions={initialReconnectionDelay:1e3,maxReconnectionDelay:3e4,reconnectionDelayGrowFactor:1.5,maxRetries:2};this.url=new URL(url);this.headers=headers;this.authProvider=authProvider;this.redirectMode=redirect;this.sessionId=initialSessionId;this.protocolVersion=initialProtocolVersion;this.onSessionIdChange=onSessionIdChange;this.onSessionExpired=onSessionExpired;this.terminateSessionOnClose=terminateSessionOnClose;this.fetchFn=fetchFn!=null?fetchFn:globalThis.fetch;}setProtocolVersion(version){this.protocolVersion=version;}async commonHeaders({base,includeSessionId=true}){var _a3;const headers={...this.headers,...base,"mcp-protocol-version":(_a3=this.protocolVersion)!=null?_a3:LATEST_PROTOCOL_VERSION};if(includeSessionId&&this.sessionId){headers["mcp-session-id"]=this.sessionId;}if(this.authProvider){const tokens=await this.authProvider.tokens();if(tokens==null?void 0:tokens.access_token){headers["Authorization"]=`Bearer ${tokens.access_token}`;}}return withUserAgentSuffix(headers,`ai-sdk/${VERSION}`,getRuntimeEnvironmentUserAgent());}setSessionId(sessionId){var _a3;if(this.sessionId===sessionId){return;}this.sessionId=sessionId;(_a3=this.onSessionIdChange)==null?void 0:_a3.call(this,sessionId);}applySessionIdFromResponse(response){const sessionId=response.headers.get("mcp-session-id");if(sessionId){this.setSessionId(sessionId);}}expireSessionId(sessionId){var _a3;if(this.sessionId===sessionId){this.setSessionId(void 0);}(_a3=this.onSessionExpired)==null?void 0:_a3.call(this,sessionId);}/**
   * Runs a single OAuth recovery flow for concurrent 401 responses.
   */authorizeOnce(resourceMetadataUrl){if(!this.authProvider){return Promise.resolve("REDIRECT");}if(!this.authPromise){this.authPromise=auth(this.authProvider,{serverUrl:this.url,resourceMetadataUrl,fetchFn:this.fetchFn}).finally(()=>{this.authPromise=void 0;});}return this.authPromise;}async start(){if(this.abortController){throw new MCPClientError({message:"MCP HTTP Transport Error: Transport already started. Note: client.connect() calls start() automatically."});}this.abortController=new AbortController();void this.openInboundSse();}async close(){var _a3,_b3,_c;(_a3=this.inboundSseConnection)==null?void 0:_a3.close();try{if(this.sessionId&&this.terminateSessionOnClose&&this.abortController&&!this.abortController.signal.aborted){const headers=await this.commonHeaders({base:{}});await this.fetchFn(this.url.href,{method:"DELETE",headers,signal:this.abortController.signal,redirect:this.redirectMode}).catch(()=>void 0);}}catch(e){}(_b3=this.abortController)==null?void 0:_b3.abort();(_c=this.onclose)==null?void 0:_c.call(this);}async send(message){const attempt=async(triedAuth=false)=>{var _a3,_b3,_c,_d,_e,_f,_g;try{const isInitializeRequest="method"in message&&message.method==="initialize";const sessionIdForRequest=isInitializeRequest?void 0:this.sessionId;const headers=await this.commonHeaders({base:{"Content-Type":"application/json",Accept:"application/json, text/event-stream"},includeSessionId:!isInitializeRequest});const init={method:"POST",headers,body:JSON.stringify(message),signal:(_a3=this.abortController)==null?void 0:_a3.signal,redirect:this.redirectMode};const response=await this.fetchFn(this.url.href,init);this.applySessionIdFromResponse(response);if(response.status===401&&this.authProvider&&!triedAuth){this.resourceMetadataUrl=extractResourceMetadataUrl(response);try{const result=await this.authorizeOnce(this.resourceMetadataUrl);if(result!=="AUTHORIZED"){const error2=new UnauthorizedError();throw error2;}}catch(error2){(_b3=this.onerror)==null?void 0:_b3.call(this,error2);throw error2;}return attempt(true);}if(response.status===202){if(!this.inboundSseConnection){void this.openInboundSse();}return;}if(!response.ok){const text=await response.text().catch(()=>null);let errorMessage=`MCP HTTP Transport Error: POSTing to endpoint (HTTP ${response.status}): ${text}`;if(response.status===404){if(sessionIdForRequest){this.expireSessionId(sessionIdForRequest);errorMessage+=". The MCP session expired. Create a new client without `initialSessionId` to start a fresh session";}else {errorMessage+=". This server does not support HTTP transport. Try using `sse` transport instead";}}const error2=new MCPClientError({message:errorMessage,statusCode:response.status,url:this.url.href,responseBody:text!=null?text:void 0});(_c=this.onerror)==null?void 0:_c.call(this,error2);throw error2;}const isNotification=!("id"in message);if(isNotification){return;}const contentType=response.headers.get("content-type")||"";if(contentType.includes("application/json")){const data=await response.json();const messages=Array.isArray(data)?data.map(message2=>JSONRPCMessageSchema$1.parse(message2)):[JSONRPCMessageSchema$1.parse(data)];for(const jsonRpcMessage of messages){(_d=this.onmessage)==null?void 0:_d.call(this,jsonRpcMessage);}return;}if(contentType.includes("text/event-stream")){if(!response.body){const error2=new MCPClientError({message:"MCP HTTP Transport Error: text/event-stream response without body",statusCode:response.status,url:this.url.href});(_e=this.onerror)==null?void 0:_e.call(this,error2);throw error2;}const stream=response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());const reader=stream.getReader();const processEvents=async()=>{var _a4,_b4,_c2;try{while(true){const{done,value}=await reader.read();if(done)return;const{event,data}=value;if(isMessageEvent2(event)){try{const jsonRpcMessage=await parseJSONRPCMessage(data);(_a4=this.onmessage)==null?void 0:_a4.call(this,jsonRpcMessage);}catch(error2){const e=new MCPClientError({message:"MCP HTTP Transport Error: Failed to parse message",cause:error2});(_b4=this.onerror)==null?void 0:_b4.call(this,e);}}}}catch(error2){if(error2 instanceof Error&&error2.name==="AbortError"){return;}(_c2=this.onerror)==null?void 0:_c2.call(this,error2);}};processEvents();return;}const error=new MCPClientError({message:`MCP HTTP Transport Error: Unexpected content type: ${contentType}`,statusCode:response.status,url:this.url.href});(_f=this.onerror)==null?void 0:_f.call(this,error);throw error;}catch(error){(_g=this.onerror)==null?void 0:_g.call(this,error);throw error;}};await attempt();}getNextReconnectionDelay(attempt){const{initialReconnectionDelay,reconnectionDelayGrowFactor,maxReconnectionDelay}=this.reconnectionOptions;return Math.min(initialReconnectionDelay*Math.pow(reconnectionDelayGrowFactor,attempt),maxReconnectionDelay);}scheduleInboundSseReconnection(){var _a3;const{maxRetries}=this.reconnectionOptions;if(maxRetries>0&&this.inboundReconnectAttempts>=maxRetries){(_a3=this.onerror)==null?void 0:_a3.call(this,new MCPClientError({message:`MCP HTTP Transport Error: Maximum reconnection attempts (${maxRetries}) exceeded.`}));return;}const delay=this.getNextReconnectionDelay(this.inboundReconnectAttempts);this.inboundReconnectAttempts+=1;setTimeout(async()=>{var _a4;if((_a4=this.abortController)==null?void 0:_a4.signal.aborted)return;await this.openInboundSse(false,this.lastInboundEventId);},delay);}// Open optional inbound SSE stream; best-effort and resumable
async openInboundSse(triedAuth=false,resumeToken){var _a3,_b3,_c,_d,_e,_f;try{const sessionIdForRequest=this.sessionId;const headers=await this.commonHeaders({base:{Accept:"text/event-stream"}});if(resumeToken){headers["last-event-id"]=resumeToken;}const response=await this.fetchFn(this.url.href,{method:"GET",headers,signal:(_a3=this.abortController)==null?void 0:_a3.signal,redirect:this.redirectMode});this.applySessionIdFromResponse(response);if(response.status===401&&this.authProvider&&!triedAuth){this.resourceMetadataUrl=extractResourceMetadataUrl(response);try{const result=await this.authorizeOnce(this.resourceMetadataUrl);if(result!=="AUTHORIZED"){const error=new UnauthorizedError();(_b3=this.onerror)==null?void 0:_b3.call(this,error);return;}}catch(error){(_c=this.onerror)==null?void 0:_c.call(this,error);return;}return this.openInboundSse(true,resumeToken);}if(response.status===405){return;}if(!response.ok||!response.body){if(response.status===404&&sessionIdForRequest){this.expireSessionId(sessionIdForRequest);}const error=new MCPClientError({message:`MCP HTTP Transport Error: GET SSE failed: ${response.status} ${response.statusText}`,statusCode:response.status,url:this.url.href});(_d=this.onerror)==null?void 0:_d.call(this,error);return;}const stream=response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());const reader=stream.getReader();const processEvents=async()=>{var _a4,_b4,_c2,_d2;try{while(true){const{done,value}=await reader.read();if(done)return;const{event,data,id}=value;if(id){this.lastInboundEventId=id;}if(isMessageEvent2(event)){try{const jsonRpcMessage=await parseJSONRPCMessage(data);(_a4=this.onmessage)==null?void 0:_a4.call(this,jsonRpcMessage);}catch(error){const e=new MCPClientError({message:"MCP HTTP Transport Error: Failed to parse message",cause:error});(_b4=this.onerror)==null?void 0:_b4.call(this,e);}}}}catch(error){if(error instanceof Error&&error.name==="AbortError"){return;}(_c2=this.onerror)==null?void 0:_c2.call(this,error);if(!((_d2=this.abortController)==null?void 0:_d2.signal.aborted)){this.scheduleInboundSseReconnection();}}};this.inboundSseConnection={close:()=>reader.cancel()};this.inboundReconnectAttempts=0;processEvents();}catch(error){if(error instanceof Error&&error.name==="AbortError"){return;}(_e=this.onerror)==null?void 0:_e.call(this,error);if(!((_f=this.abortController)==null?void 0:_f.signal.aborted)){this.scheduleInboundSseReconnection();}}}};// src/tool/mcp-transport.ts
function createMcpTransport(config){switch(config.type){case "sse":return new SseMCPTransport(config);case "http":return new HttpMCPTransport(config);default:throw new MCPClientError({message:"Unsupported or invalid transport configuration. If you are using a custom transport, make sure it implements the MCPTransport interface."});}}function isCustomMcpTransport(transport){return "start"in transport&&typeof transport.start==="function"&&"send"in transport&&typeof transport.send==="function"&&"close"in transport&&typeof transport.close==="function";}// src/tool/mcp-apps.ts
var MCP_APP_MIME_TYPE="text/html;profile=mcp-app";var MCP_APP_LEGACY_RESOURCE_URI_META_KEY="ui/resourceUri";function getToolUiMeta(meta){const uiMeta=meta==null?void 0:meta.ui;return isJSONObject(uiMeta)?uiMeta:void 0;}function parseVisibility(value){return Array.isArray(value)?value.filter(v=>v==="model"||v==="app"):void 0;}function getMCPAppToolMeta(tool2){var _a3,_b3;const uiMeta=getToolUiMeta(tool2._meta);const resourceUri=(_b3=uiMeta==null?void 0:uiMeta.resourceUri)!=null?_b3:(_a3=tool2._meta)==null?void 0:_a3[MCP_APP_LEGACY_RESOURCE_URI_META_KEY];const visibility=parseVisibility(uiMeta==null?void 0:uiMeta.visibility);if(resourceUri!==void 0){if(typeof resourceUri!=="string"||!resourceUri.startsWith("ui://")){throw new Error(`Invalid MCP App resource URI: ${JSON.stringify(resourceUri)}`);}}else if(uiMeta==null){return void 0;}return {...uiMeta,...(resourceUri!=null?{resourceUri}:{}),...(visibility!=null?{visibility}:{})};}var CLIENT_VERSION="1.0.0";function mcpToModelOutput({output}){const result=output;if(!("content"in result)||!Array.isArray(result.content)){return {type:"json",value:result};}const convertedContent=result.content.map(part=>{if(part.type==="text"&&"text"in part){return {type:"text",text:part.text};}if(part.type==="image"&&"data"in part&&"mimeType"in part){return {type:"file",mediaType:part.mimeType,data:{type:"data",data:part.data}};}return {type:"text",text:JSON.stringify(part)};});return {type:"content",value:convertedContent};}async function createMCPClient(config){const client=new DefaultMCPClient(config);await client.init();return client;}var DefaultMCPClient=class{constructor({transport:transportConfig,name:name3,clientName=name3!=null?name3:"ai-sdk-mcp-client",version=CLIENT_VERSION,onUncaughtError,capabilities,initialInitializeResult}){this.requestMessageId=0;this.responseHandlers=/* @__PURE__ */new Map();this.serverCapabilities={};this._serverInfo={name:"",version:""};this._initializeResult={protocolVersion:LATEST_PROTOCOL_VERSION,capabilities:{},serverInfo:this._serverInfo};this.isClosed=true;this.onUncaughtError=onUncaughtError;this.clientCapabilities=capabilities!=null?capabilities:{};this.initialInitializeResult=initialInitializeResult;if(isCustomMcpTransport(transportConfig)){this.transport=transportConfig;}else {this.transport=createMcpTransport(transportConfig);}this.transport.onclose=()=>this.onClose();this.transport.onerror=error=>this.onError(error);this.transport.onmessage=message=>{if("method"in message){if("id"in message){this.onRequestMessage(message);}else {this.onError(new MCPClientError({message:"Unsupported message type"}));}return;}this.onResponse(message);};this.clientInfo={name:clientName,version};}get serverInfo(){return this._serverInfo;}get initializeResult(){return this._initializeResult;}get instructions(){return this._serverInstructions;}async init(){try{await this.transport.start();this.isClosed=false;if(this.initialInitializeResult){const result2=InitializeResultSchema$1.parse(this.initialInitializeResult);this.applyInitializeResult(result2);return this;}const result=await this.request({request:{method:"initialize",params:{protocolVersion:LATEST_PROTOCOL_VERSION,capabilities:this.clientCapabilities,clientInfo:this.clientInfo}},resultSchema:InitializeResultSchema$1});if(result===void 0){throw new MCPClientError({message:"Server sent invalid initialize result"});}this.applyInitializeResult(result);await this.notification({method:"notifications/initialized"});return this;}catch(error){await this.close();throw error;}}applyInitializeResult(result){if(!SUPPORTED_PROTOCOL_VERSIONS.includes(result.protocolVersion)){throw new MCPClientError({message:`Server's protocol version is not supported: ${result.protocolVersion}`});}this.serverCapabilities=result.capabilities;this._serverInfo=result.serverInfo;this._initializeResult=result;if(this.transport.setProtocolVersion){this.transport.setProtocolVersion(result.protocolVersion);}else {this.transport.protocolVersion=result.protocolVersion;}this._serverInstructions=result.instructions;}async close(){var _a3;if(this.isClosed)return;await((_a3=this.transport)==null?void 0:_a3.close());this.onClose();}assertCapability(method){switch(method){case "initialize":break;case "completion/complete":if(!this.serverCapabilities.completions){throw new MCPClientError({message:`Server does not support completions`});}break;case "tools/list":case "tools/call":if(!this.serverCapabilities.tools){throw new MCPClientError({message:`Server does not support tools`});}break;case "resources/list":case "resources/read":case "resources/templates/list":if(!this.serverCapabilities.resources){throw new MCPClientError({message:`Server does not support resources`});}break;case "prompts/list":case "prompts/get":if(!this.serverCapabilities.prompts){throw new MCPClientError({message:`Server does not support prompts`});}break;default:throw new MCPClientError({message:`Unsupported method: ${method}`});}}async request({request,resultSchema,options}){return new Promise((resolve,reject)=>{if(this.isClosed){return reject(new MCPClientError({message:"Attempted to send a request from a closed client"}));}this.assertCapability(request.method);const signal=options==null?void 0:options.signal;signal==null?void 0:signal.throwIfAborted();const messageId=this.requestMessageId++;const jsonrpcRequest={...request,jsonrpc:"2.0",id:messageId};const cleanup=()=>{this.responseHandlers.delete(messageId);};this.responseHandlers.set(messageId,response=>{if(signal==null?void 0:signal.aborted){return reject(new MCPClientError({message:"Request was aborted",cause:signal.reason}));}if(response instanceof Error){return reject(response);}try{const result=resultSchema.parse(response.result);resolve(result);}catch(error){const parseError=new MCPClientError({message:"Failed to parse server response",cause:error});reject(parseError);}});this.transport.send(jsonrpcRequest).catch(error=>{cleanup();reject(error);});});}async listTools({params,options}={}){return this.request({request:{method:"tools/list",params},resultSchema:ListToolsResultSchema$1,options});}async callTool({name:name3,arguments:args={},options}){try{return this.request({request:{method:"tools/call",params:{name:name3,arguments:args}},resultSchema:CallToolResultSchema$1,options});}catch(error){throw error;}}async listResourcesInternal({params,options}={}){try{return this.request({request:{method:"resources/list",params},resultSchema:ListResourcesResultSchema$1,options});}catch(error){throw error;}}async readResourceInternal({uri,options}){try{return this.request({request:{method:"resources/read",params:{uri}},resultSchema:ReadResourceResultSchema$1,options});}catch(error){throw error;}}async listResourceTemplatesInternal({options}={}){try{return this.request({request:{method:"resources/templates/list"},resultSchema:ListResourceTemplatesResultSchema$1,options});}catch(error){throw error;}}async listPromptsInternal({params,options}={}){try{return this.request({request:{method:"prompts/list",params},resultSchema:ListPromptsResultSchema$1,options});}catch(error){throw error;}}async getPromptInternal({name:name3,args,options}){try{return this.request({request:{method:"prompts/get",params:{name:name3,arguments:args}},resultSchema:GetPromptResultSchema$1,options});}catch(error){throw error;}}async completeInternal({options,...params}){return this.request({request:{method:"completion/complete",params},resultSchema:CompleteResultSchema$1,options});}async notification(notification){const jsonrpcNotification={...notification,jsonrpc:"2.0"};await this.transport.send(jsonrpcNotification);}/**
   * Returns a set of AI SDK tools from the MCP server.
   * This fetches tool definitions and wraps them with execute functions.
   * @returns A record of tool names to their implementations
   */async tools({schemas="automatic"}={}){const definitions=await this.listTools();return this.toolsFromDefinitions(definitions,{schemas});}/**
   * Creates AI SDK tools from tool definitions without fetching from the server.
   */toolsFromDefinitions(definitions,{schemas="automatic"}={}){var _a3,_b3;const tools={};for(const{name:name3,title,description,inputSchema,annotations,_meta}of definitions.tools){const resolvedTitle=title!=null?title:annotations==null?void 0:annotations.title;if(schemas!=="automatic"&&!Object.prototype.hasOwnProperty.call(schemas,name3)){continue;}const self=this;const outputSchema=schemas!=="automatic"?(_a3=schemas[name3])==null?void 0:_a3.outputSchema:void 0;const appMeta=getMCPAppToolMeta({_meta});const metadata={clientName:this.clientInfo.name,toolName:name3,...(resolvedTitle!=null?{title:resolvedTitle}:{}),...((appMeta==null?void 0:appMeta.resourceUri)!=null?{app:{...appMeta,mimeType:MCP_APP_MIME_TYPE}}:{})};const execute=async(args,options)=>{var _a4;(_a4=options==null?void 0:options.abortSignal)==null?void 0:_a4.throwIfAborted();const result=await self.callTool({name:name3,arguments:args,options:{signal:options==null?void 0:options.abortSignal}});if(result.isError){return result;}if(outputSchema!=null){return self.extractStructuredContent(result,outputSchema,name3);}return result;};const toolWithExecute=schemas==="automatic"?dynamicTool({description,title:resolvedTitle,metadata,inputSchema:jsonSchema({...inputSchema,properties:(_b3=inputSchema.properties)!=null?_b3:{},additionalProperties:false}),execute,toModelOutput:mcpToModelOutput}):tool({description,title:resolvedTitle,metadata,inputSchema:schemas[name3].inputSchema,...(outputSchema!=null?{outputSchema}:{}),execute,toModelOutput:mcpToModelOutput});tools[name3]={...toolWithExecute,_meta};}return tools;}/**
   * Extracts and validates structuredContent from a tool result.
   */async extractStructuredContent(result,outputSchema,toolName){if("structuredContent"in result&&result.structuredContent!=null){const validationResult=await safeValidateTypes({value:result.structuredContent,schema:asSchema(outputSchema)});if(!validationResult.success){throw new MCPClientError({message:`Tool "${toolName}" returned structuredContent that does not match the expected outputSchema`,cause:validationResult.error});}return validationResult.value;}if("content"in result&&Array.isArray(result.content)){const textContent=result.content.find(c=>c.type==="text");if(textContent&&"text"in textContent){const parseResult=await safeParseJSON({text:textContent.text,schema:outputSchema});if(!parseResult.success){throw new MCPClientError({message:`Tool "${toolName}" returned content that does not match the expected outputSchema`,cause:parseResult.error});}return parseResult.value;}}throw new MCPClientError({message:`Tool "${toolName}" did not return structuredContent or parseable text content`});}listResources({params,options}={}){return this.listResourcesInternal({params,options});}readResource({uri,options}){return this.readResourceInternal({uri,options});}listResourceTemplates({options}={}){return this.listResourceTemplatesInternal({options});}experimental_listPrompts({params,options}={}){return this.listPromptsInternal({params,options});}experimental_getPrompt({name:name3,arguments:args,options}){return this.getPromptInternal({name:name3,args,options});}complete(args){return this.completeInternal(args);}onElicitationRequest(schema,handler){if(schema!==ElicitationRequestSchema){throw new MCPClientError({message:"Unsupported request schema. Only ElicitationRequestSchema is supported."});}this.elicitationRequestHandler=handler;}async onRequestMessage(request){try{if(request.method==="ping"){await this.transport.send({jsonrpc:"2.0",id:request.id,result:{}});return;}if(request.method!=="elicitation/create"){await this.transport.send({jsonrpc:"2.0",id:request.id,error:{code:-32601,message:`Unsupported request method: ${request.method}`}});return;}if(!this.elicitationRequestHandler){await this.transport.send({jsonrpc:"2.0",id:request.id,error:{code:-32601,message:"No elicitation handler registered on client"}});return;}const parsedRequest=ElicitationRequestSchema.safeParse({method:request.method,params:request.params});if(!parsedRequest.success){await this.transport.send({jsonrpc:"2.0",id:request.id,error:{code:-32602,message:`Invalid elicitation request: ${parsedRequest.error.message}`,data:parsedRequest.error.issues}});return;}try{const result=await this.elicitationRequestHandler(parsedRequest.data);const validatedResult=ElicitResultSchema$1.parse(result);await this.transport.send({jsonrpc:"2.0",id:request.id,result:validatedResult});}catch(error){await this.transport.send({jsonrpc:"2.0",id:request.id,error:{code:-32603,message:error instanceof Error?error.message:"Failed to handle elicitation request"}});this.onError(error);}}catch(error){this.onError(error);}}onClose(){if(this.isClosed)return;this.isClosed=true;const error=new MCPClientError({message:"Connection closed"});for(const handler of this.responseHandlers.values()){handler(error);}this.responseHandlers.clear();}onError(error){if(this.onUncaughtError){this.onUncaughtError(error);}}onResponse(response){const messageId=Number(response.id);const handler=this.responseHandlers.get(messageId);if(handler===void 0){throw new MCPClientError({message:`Protocol error: Received a response for an unknown message ID: ${JSON.stringify(response)}`});}this.responseHandlers.delete(messageId);handler("result"in response?response:new MCPClientError({message:response.error.message,code:response.error.code,data:response.error.data,cause:response.error}));}};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var crossSpawn = {exports: {}};

var windows;var hasRequiredWindows;function requireWindows(){if(hasRequiredWindows)return windows;hasRequiredWindows=1;windows=isexe;isexe.sync=sync;var fs=require$$0;function checkPathExt(path,options){var pathext=options.pathExt!==undefined?options.pathExt:process.env.PATHEXT;if(!pathext){return true;}pathext=pathext.split(';');if(pathext.indexOf('')!==-1){return true;}for(var i=0;i<pathext.length;i++){var p=pathext[i].toLowerCase();if(p&&path.substr(-p.length).toLowerCase()===p){return true;}}return false;}function checkStat(stat,path,options){if(!stat.isSymbolicLink()&&!stat.isFile()){return false;}return checkPathExt(path,options);}function isexe(path,options,cb){fs.stat(path,function(er,stat){cb(er,er?false:checkStat(stat,path,options));});}function sync(path,options){return checkStat(fs.statSync(path),path,options);}return windows;}

var mode;var hasRequiredMode;function requireMode(){if(hasRequiredMode)return mode;hasRequiredMode=1;mode=isexe;isexe.sync=sync;var fs=require$$0;function isexe(path,options,cb){fs.stat(path,function(er,stat){cb(er,er?false:checkStat(stat,options));});}function sync(path,options){return checkStat(fs.statSync(path),options);}function checkStat(stat,options){return stat.isFile()&&checkMode(stat,options);}function checkMode(stat,options){var mod=stat.mode;var uid=stat.uid;var gid=stat.gid;var myUid=options.uid!==undefined?options.uid:process.getuid&&process.getuid();var myGid=options.gid!==undefined?options.gid:process.getgid&&process.getgid();var u=parseInt('100',8);var g=parseInt('010',8);var o=parseInt('001',8);var ug=u|g;var ret=mod&o||mod&g&&gid===myGid||mod&u&&uid===myUid||mod&ug&&myUid===0;return ret;}return mode;}

var isexe_1;var hasRequiredIsexe;function requireIsexe(){if(hasRequiredIsexe)return isexe_1;hasRequiredIsexe=1;var core;if(process.platform==='win32'||commonjsGlobal.TESTING_WINDOWS){core=requireWindows();}else {core=requireMode();}isexe_1=isexe;isexe.sync=sync;function isexe(path,options,cb){if(typeof options==='function'){cb=options;options={};}if(!cb){if(typeof Promise!=='function'){throw new TypeError('callback not provided');}return new Promise(function(resolve,reject){isexe(path,options||{},function(er,is){if(er){reject(er);}else {resolve(is);}});});}core(path,options||{},function(er,is){// ignore EACCES because that just means we aren't allowed to run it
if(er){if(er.code==='EACCES'||options&&options.ignoreErrors){er=null;is=false;}}cb(er,is);});}function sync(path,options){// my kingdom for a filtered catch
try{return core.sync(path,options||{});}catch(er){if(options&&options.ignoreErrors||er.code==='EACCES'){return false;}else {throw er;}}}return isexe_1;}

var which_1;var hasRequiredWhich;function requireWhich(){if(hasRequiredWhich)return which_1;hasRequiredWhich=1;const isWindows=process.platform==='win32'||process.env.OSTYPE==='cygwin'||process.env.OSTYPE==='msys';const path=require$$0$1;const COLON=isWindows?';':':';const isexe=requireIsexe();const getNotFoundError=cmd=>Object.assign(new Error(`not found: ${cmd}`),{code:'ENOENT'});const getPathInfo=(cmd,opt)=>{const colon=opt.colon||COLON;// If it has a slash, then we don't bother searching the pathenv.
// just check the file itself, and that's it.
const pathEnv=cmd.match(/\//)||isWindows&&cmd.match(/\\/)?['']:[// windows always checks the cwd first
...(isWindows?[process.cwd()]:[]),...(opt.path||process.env.PATH||/* istanbul ignore next: very unusual */'').split(colon)];const pathExtExe=isWindows?opt.pathExt||process.env.PATHEXT||'.EXE;.CMD;.BAT;.COM':'';const pathExt=isWindows?pathExtExe.split(colon):[''];if(isWindows){if(cmd.indexOf('.')!==-1&&pathExt[0]!=='')pathExt.unshift('');}return {pathEnv,pathExt,pathExtExe};};const which=(cmd,opt,cb)=>{if(typeof opt==='function'){cb=opt;opt={};}if(!opt)opt={};const{pathEnv,pathExt,pathExtExe}=getPathInfo(cmd,opt);const found=[];const step=i=>new Promise((resolve,reject)=>{if(i===pathEnv.length)return opt.all&&found.length?resolve(found):reject(getNotFoundError(cmd));const ppRaw=pathEnv[i];const pathPart=/^".*"$/.test(ppRaw)?ppRaw.slice(1,-1):ppRaw;const pCmd=path.join(pathPart,cmd);const p=!pathPart&&/^\.[\\\/]/.test(cmd)?cmd.slice(0,2)+pCmd:pCmd;resolve(subStep(p,i,0));});const subStep=(p,i,ii)=>new Promise((resolve,reject)=>{if(ii===pathExt.length)return resolve(step(i+1));const ext=pathExt[ii];isexe(p+ext,{pathExt:pathExtExe},(er,is)=>{if(!er&&is){if(opt.all)found.push(p+ext);else return resolve(p+ext);}return resolve(subStep(p,i,ii+1));});});return cb?step(0).then(res=>cb(null,res),cb):step(0);};const whichSync=(cmd,opt)=>{opt=opt||{};const{pathEnv,pathExt,pathExtExe}=getPathInfo(cmd,opt);const found=[];for(let i=0;i<pathEnv.length;i++){const ppRaw=pathEnv[i];const pathPart=/^".*"$/.test(ppRaw)?ppRaw.slice(1,-1):ppRaw;const pCmd=path.join(pathPart,cmd);const p=!pathPart&&/^\.[\\\/]/.test(cmd)?cmd.slice(0,2)+pCmd:pCmd;for(let j=0;j<pathExt.length;j++){const cur=p+pathExt[j];try{const is=isexe.sync(cur,{pathExt:pathExtExe});if(is){if(opt.all)found.push(cur);else return cur;}}catch(ex){}}}if(opt.all&&found.length)return found;if(opt.nothrow)return null;throw getNotFoundError(cmd);};which_1=which;which.sync=whichSync;return which_1;}

var pathKey = {exports: {}};

var hasRequiredPathKey;function requirePathKey(){if(hasRequiredPathKey)return pathKey.exports;hasRequiredPathKey=1;const pathKey$1=(options={})=>{const environment=options.env||process.env;const platform=options.platform||process.platform;if(platform!=='win32'){return 'PATH';}return Object.keys(environment).reverse().find(key=>key.toUpperCase()==='PATH')||'Path';};pathKey.exports=pathKey$1;// TODO: Remove this for the next major release
pathKey.exports.default=pathKey$1;return pathKey.exports;}

var resolveCommand_1;var hasRequiredResolveCommand;function requireResolveCommand(){if(hasRequiredResolveCommand)return resolveCommand_1;hasRequiredResolveCommand=1;const path=require$$0$1;const which=requireWhich();const getPathKey=requirePathKey();function resolveCommandAttempt(parsed,withoutPathExt){const env=parsed.options.env||process.env;const cwd=process.cwd();const hasCustomCwd=parsed.options.cwd!=null;// Worker threads do not have process.chdir()
const shouldSwitchCwd=hasCustomCwd&&process.chdir!==undefined&&!process.chdir.disabled;// If a custom `cwd` was specified, we need to change the process cwd
// because `which` will do stat calls but does not support a custom cwd
if(shouldSwitchCwd){try{process.chdir(parsed.options.cwd);}catch(err){/* Empty */}}let resolved;try{resolved=which.sync(parsed.command,{path:env[getPathKey({env})],pathExt:withoutPathExt?path.delimiter:undefined});}catch(e){/* Empty */}finally{if(shouldSwitchCwd){process.chdir(cwd);}}// If we successfully resolved, ensure that an absolute path is returned
// Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
if(resolved){resolved=path.resolve(hasCustomCwd?parsed.options.cwd:'',resolved);}return resolved;}function resolveCommand(parsed){return resolveCommandAttempt(parsed)||resolveCommandAttempt(parsed,true);}resolveCommand_1=resolveCommand;return resolveCommand_1;}

var _escape = {};

var hasRequired_escape;function require_escape(){if(hasRequired_escape)return _escape;hasRequired_escape=1;const metaCharsRegExp=/([()\][%!^"`<>&|;, *?])/g;function escapeCommand(arg){// Escape meta chars
arg=arg.replace(metaCharsRegExp,'^$1');return arg;}function escapeArgument(arg,doubleEscapeMetaChars){// Convert to string
arg=`${arg}`;// Algorithm below is based on https://qntm.org/cmd
// It's slightly altered to disable JS backtracking to avoid hanging on specially crafted input
// Please see https://github.com/moxystudio/node-cross-spawn/pull/160 for more information
// Sequence of backslashes followed by a double quote:
// double up all the backslashes and escape the double quote
arg=arg.replace(/(?=(\\+?)?)\1"/g,'$1$1\\"');// Sequence of backslashes followed by the end of the string
// (which will become a double quote later):
// double up all the backslashes
arg=arg.replace(/(?=(\\+?)?)\1$/,'$1$1');// All other backslashes occur literally
// Quote the whole thing:
arg=`"${arg}"`;// Escape meta chars
arg=arg.replace(metaCharsRegExp,'^$1');// Double escape meta chars if necessary
if(doubleEscapeMetaChars){arg=arg.replace(metaCharsRegExp,'^$1');}return arg;}_escape.command=escapeCommand;_escape.argument=escapeArgument;return _escape;}

var shebangRegex;var hasRequiredShebangRegex;function requireShebangRegex(){if(hasRequiredShebangRegex)return shebangRegex;hasRequiredShebangRegex=1;shebangRegex=/^#!(.*)/;return shebangRegex;}

var shebangCommand;var hasRequiredShebangCommand;function requireShebangCommand(){if(hasRequiredShebangCommand)return shebangCommand;hasRequiredShebangCommand=1;const shebangRegex=requireShebangRegex();shebangCommand=(string='')=>{const match=string.match(shebangRegex);if(!match){return null;}const[path,argument]=match[0].replace(/#! ?/,'').split(' ');const binary=path.split('/').pop();if(binary==='env'){return argument;}return argument?`${binary} ${argument}`:binary;};return shebangCommand;}

var readShebang_1;var hasRequiredReadShebang;function requireReadShebang(){if(hasRequiredReadShebang)return readShebang_1;hasRequiredReadShebang=1;const fs=require$$0;const shebangCommand=requireShebangCommand();function readShebang(command){// Read the first 150 bytes from the file
const size=150;const buffer=Buffer.alloc(size);let fd;try{fd=fs.openSync(command,'r');fs.readSync(fd,buffer,0,size,0);fs.closeSync(fd);}catch(e){/* Empty */}// Attempt to extract shebang (null is returned if not a shebang)
return shebangCommand(buffer.toString());}readShebang_1=readShebang;return readShebang_1;}

var parse_1;var hasRequiredParse;function requireParse(){if(hasRequiredParse)return parse_1;hasRequiredParse=1;const path=require$$0$1;const resolveCommand=requireResolveCommand();const escape=require_escape();const readShebang=requireReadShebang();const isWin=process.platform==='win32';const isExecutableRegExp=/\.(?:com|exe)$/i;const isCmdShimRegExp=/node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;function detectShebang(parsed){parsed.file=resolveCommand(parsed);const shebang=parsed.file&&readShebang(parsed.file);if(shebang){parsed.args.unshift(parsed.file);parsed.command=shebang;return resolveCommand(parsed);}return parsed.file;}function parseNonShell(parsed){if(!isWin){return parsed;}// Detect & add support for shebangs
const commandFile=detectShebang(parsed);// We don't need a shell if the command filename is an executable
const needsShell=!isExecutableRegExp.test(commandFile);// If a shell is required, use cmd.exe and take care of escaping everything correctly
// Note that `forceShell` is an hidden option used only in tests
if(parsed.options.forceShell||needsShell){// Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
// The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
// Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
// we need to double escape them
const needsDoubleEscapeMetaChars=isCmdShimRegExp.test(commandFile);// Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
// This is necessary otherwise it will always fail with ENOENT in those cases
parsed.command=path.normalize(parsed.command);// Escape command & arguments
parsed.command=escape.command(parsed.command);parsed.args=parsed.args.map(arg=>escape.argument(arg,needsDoubleEscapeMetaChars));const shellCommand=[parsed.command].concat(parsed.args).join(' ');parsed.args=['/d','/s','/c',`"${shellCommand}"`];parsed.command=process.env.comspec||'cmd.exe';parsed.options.windowsVerbatimArguments=true;// Tell node's spawn that the arguments are already escaped
}return parsed;}function parse(command,args,options){// Normalize arguments, similar to nodejs
if(args&&!Array.isArray(args)){options=args;args=null;}args=args?args.slice(0):[];// Clone array to avoid changing the original
options=Object.assign({},options);// Clone object to avoid changing the original
// Build our parsed object
const parsed={command,args,options,file:undefined,original:{command,args}};// Delegate further parsing to shell or non-shell
return options.shell?parsed:parseNonShell(parsed);}parse_1=parse;return parse_1;}

var enoent;var hasRequiredEnoent;function requireEnoent(){if(hasRequiredEnoent)return enoent;hasRequiredEnoent=1;const isWin=process.platform==='win32';function notFoundError(original,syscall){return Object.assign(new Error(`${syscall} ${original.command} ENOENT`),{code:'ENOENT',errno:'ENOENT',syscall:`${syscall} ${original.command}`,path:original.command,spawnargs:original.args});}function hookChildProcess(cp,parsed){if(!isWin){return;}const originalEmit=cp.emit;cp.emit=function(name,arg1){// If emitting "exit" event and exit code is 1, we need to check if
// the command exists and emit an "error" instead
// See https://github.com/IndigoUnited/node-cross-spawn/issues/16
if(name==='exit'){const err=verifyENOENT(arg1,parsed);if(err){return originalEmit.call(cp,'error',err);}}return originalEmit.apply(cp,arguments);// eslint-disable-line prefer-rest-params
};}function verifyENOENT(status,parsed){if(isWin&&status===1&&!parsed.file){return notFoundError(parsed.original,'spawn');}return null;}function verifyENOENTSync(status,parsed){if(isWin&&status===1&&!parsed.file){return notFoundError(parsed.original,'spawnSync');}return null;}enoent={hookChildProcess,verifyENOENT,verifyENOENTSync,notFoundError};return enoent;}

var hasRequiredCrossSpawn;function requireCrossSpawn(){if(hasRequiredCrossSpawn)return crossSpawn.exports;hasRequiredCrossSpawn=1;const cp=require$$0$2;const parse=requireParse();const enoent=requireEnoent();function spawn(command,args,options){// Parse the arguments
const parsed=parse(command,args,options);// Spawn the child process
const spawned=cp.spawn(parsed.command,parsed.args,parsed.options);// Hook into child process "exit" event to emit an error if the command
// does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
enoent.hookChildProcess(spawned,parsed);return spawned;}function spawnSync(command,args,options){// Parse the arguments
const parsed=parse(command,args,options);// Spawn the child process
const result=cp.spawnSync(parsed.command,parsed.args,parsed.options);// Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
result.error=result.error||enoent.verifyENOENTSync(result.status,parsed);return result;}crossSpawn.exports=spawn;crossSpawn.exports.spawn=spawn;crossSpawn.exports.sync=spawnSync;crossSpawn.exports._parse=parse;crossSpawn.exports._enoent=enoent;return crossSpawn.exports;}

var crossSpawnExports = requireCrossSpawn();
var spawn = /*@__PURE__*/getDefaultExportFromCjs(crossSpawnExports);

const RELATED_TASK_META_KEY='io.modelcontextprotocol/related-task';/* JSON-RPC types */const JSONRPC_VERSION='2.0';/**
 * Assert 'object' type schema.
 *
 * @internal
 */const AssertObjectSchema=custom(v=>v!==null&&(typeof v==='object'||typeof v==='function'));/**
 * A progress token, used to associate progress notifications with the original request.
 */const ProgressTokenSchema=union([string(),number().int()]);/**
 * An opaque token used to represent a cursor for pagination.
 */const CursorSchema=string();/**
 * Task creation parameters, used to ask that the server create a task to represent a request.
 */looseObject({/**
     * Requested duration in milliseconds to retain task from creation.
     */ttl:number().optional(),/**
     * Time in milliseconds to wait between task status requests.
     */pollInterval:number().optional()});const TaskMetadataSchema=object({ttl:number().optional()});/**
 * Metadata for associating messages with a task.
 * Include this in the `_meta` field under the key `io.modelcontextprotocol/related-task`.
 */const RelatedTaskMetadataSchema=object({taskId:string()});const RequestMetaSchema=looseObject({/**
     * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
     */progressToken:ProgressTokenSchema.optional(),/**
     * If specified, this request is related to the provided task.
     */[RELATED_TASK_META_KEY]:RelatedTaskMetadataSchema.optional()});/**
 * Common params for any request.
 */const BaseRequestParamsSchema=object({/**
     * See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.
     */_meta:RequestMetaSchema.optional()});/**
 * Common params for any task-augmented request.
 */const TaskAugmentedRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * If specified, the caller is requesting task-augmented execution for this request.
     * The request will return a CreateTaskResult immediately, and the actual result can be
     * retrieved later via tasks/result.
     *
     * Task augmentation is subject to capability negotiation - receivers MUST declare support
     * for task augmentation of specific request types in their capabilities.
     */task:TaskMetadataSchema.optional()});const RequestSchema=object({method:string(),params:BaseRequestParamsSchema.loose().optional()});const NotificationsParamsSchema=object({/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:RequestMetaSchema.optional()});const NotificationSchema=object({method:string(),params:NotificationsParamsSchema.loose().optional()});const ResultSchema=looseObject({/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:RequestMetaSchema.optional()});/**
 * A uniquely identifying ID for a request in JSON-RPC.
 */const RequestIdSchema=union([string(),number().int()]);/**
 * A request that expects a response.
 */const JSONRPCRequestSchema=object({jsonrpc:literal(JSONRPC_VERSION),id:RequestIdSchema,...RequestSchema.shape}).strict();/**
 * A notification which does not expect a response.
 */const JSONRPCNotificationSchema=object({jsonrpc:literal(JSONRPC_VERSION),...NotificationSchema.shape}).strict();/**
 * A successful (non-error) response to a request.
 */const JSONRPCResultResponseSchema=object({jsonrpc:literal(JSONRPC_VERSION),id:RequestIdSchema,result:ResultSchema}).strict();/**
 * Error codes defined by the JSON-RPC specification.
 */var ErrorCode;(function(ErrorCode){// SDK error codes
ErrorCode[ErrorCode["ConnectionClosed"]=-32e3]="ConnectionClosed";ErrorCode[ErrorCode["RequestTimeout"]=-32001]="RequestTimeout";// Standard JSON-RPC error codes
ErrorCode[ErrorCode["ParseError"]=-32700]="ParseError";ErrorCode[ErrorCode["InvalidRequest"]=-32600]="InvalidRequest";ErrorCode[ErrorCode["MethodNotFound"]=-32601]="MethodNotFound";ErrorCode[ErrorCode["InvalidParams"]=-32602]="InvalidParams";ErrorCode[ErrorCode["InternalError"]=-32603]="InternalError";// MCP-specific error codes
ErrorCode[ErrorCode["UrlElicitationRequired"]=-32042]="UrlElicitationRequired";})(ErrorCode||(ErrorCode={}));/**
 * A response to a request that indicates an error occurred.
 */const JSONRPCErrorResponseSchema=object({jsonrpc:literal(JSONRPC_VERSION),id:RequestIdSchema.optional(),error:object({/**
         * The error type that occurred.
         */code:number().int(),/**
         * A short description of the error. The message SHOULD be limited to a concise single sentence.
         */message:string(),/**
         * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
         */data:unknown().optional()})}).strict();const JSONRPCMessageSchema=union([JSONRPCRequestSchema,JSONRPCNotificationSchema,JSONRPCResultResponseSchema,JSONRPCErrorResponseSchema]);union([JSONRPCResultResponseSchema,JSONRPCErrorResponseSchema]);/* Empty result *//**
 * A response that indicates success but carries no data.
 */const EmptyResultSchema=ResultSchema.strict();const CancelledNotificationParamsSchema=NotificationsParamsSchema.extend({/**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the same direction.
     */requestId:RequestIdSchema.optional(),/**
     * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
     */reason:string().optional()});/* Cancellation *//**
 * This notification can be sent by either side to indicate that it is cancelling a previously-issued request.
 *
 * The request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.
 *
 * This notification indicates that the result will be unused, so any associated processing SHOULD cease.
 *
 * A client MUST NOT attempt to cancel its `initialize` request.
 */const CancelledNotificationSchema=NotificationSchema.extend({method:literal('notifications/cancelled'),params:CancelledNotificationParamsSchema});/* Base Metadata *//**
 * Icon schema for use in tools, prompts, resources, and implementations.
 */const IconSchema=object({/**
     * URL or data URI for the icon.
     */src:string(),/**
     * Optional MIME type for the icon.
     */mimeType:string().optional(),/**
     * Optional array of strings that specify sizes at which the icon can be used.
     * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
     *
     * If not provided, the client should assume that the icon can be used at any size.
     */sizes:array(string()).optional(),/**
     * Optional specifier for the theme this icon is designed for. `light` indicates
     * the icon is designed to be used with a light background, and `dark` indicates
     * the icon is designed to be used with a dark background.
     *
     * If not provided, the client should assume the icon can be used with any theme.
     */theme:_enum(['light','dark']).optional()});/**
 * Base schema to add `icons` property.
 *
 */const IconsSchema=object({/**
     * Optional set of sized icons that the client can display in a user interface.
     *
     * Clients that support rendering icons MUST support at least the following MIME types:
     * - `image/png` - PNG images (safe, universal compatibility)
     * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
     *
     * Clients that support rendering icons SHOULD also support:
     * - `image/svg+xml` - SVG images (scalable but requires security precautions)
     * - `image/webp` - WebP images (modern, efficient format)
     */icons:array(IconSchema).optional()});/**
 * Base metadata interface for common properties across resources, tools, prompts, and implementations.
 */const BaseMetadataSchema=object({/** Intended for programmatic or logical use, but used as a display name in past specs or fallback */name:string(),/**
     * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
     * even by those unfamiliar with domain-specific terminology.
     *
     * If not provided, the name should be used for display (except for Tool,
     * where `annotations.title` should be given precedence over using `name`,
     * if present).
     */title:string().optional()});/* Initialization *//**
 * Describes the name and version of an MCP implementation.
 */const ImplementationSchema=BaseMetadataSchema.extend({...BaseMetadataSchema.shape,...IconsSchema.shape,version:string(),/**
     * An optional URL of the website for this implementation.
     */websiteUrl:string().optional(),/**
     * An optional human-readable description of what this implementation does.
     *
     * This can be used by clients or servers to provide context about their purpose
     * and capabilities. For example, a server might describe the types of resources
     * or tools it provides, while a client might describe its intended use case.
     */description:string().optional()});const FormElicitationCapabilitySchema=intersection(object({applyDefaults:boolean().optional()}),record(string(),unknown()));const ElicitationCapabilitySchema=preprocess(value=>{if(value&&typeof value==='object'&&!Array.isArray(value)){if(Object.keys(value).length===0){return {form:{}};}}return value;},intersection(object({form:FormElicitationCapabilitySchema.optional(),url:AssertObjectSchema.optional()}),record(string(),unknown()).optional()));/**
 * Task capabilities for clients, indicating which request types support task creation.
 */const ClientTasksCapabilitySchema=looseObject({/**
     * Present if the client supports listing tasks.
     */list:AssertObjectSchema.optional(),/**
     * Present if the client supports cancelling tasks.
     */cancel:AssertObjectSchema.optional(),/**
     * Capabilities for task creation on specific request types.
     */requests:looseObject({/**
         * Task support for sampling requests.
         */sampling:looseObject({createMessage:AssertObjectSchema.optional()}).optional(),/**
         * Task support for elicitation requests.
         */elicitation:looseObject({create:AssertObjectSchema.optional()}).optional()}).optional()});/**
 * Task capabilities for servers, indicating which request types support task creation.
 */const ServerTasksCapabilitySchema=looseObject({/**
     * Present if the server supports listing tasks.
     */list:AssertObjectSchema.optional(),/**
     * Present if the server supports cancelling tasks.
     */cancel:AssertObjectSchema.optional(),/**
     * Capabilities for task creation on specific request types.
     */requests:looseObject({/**
         * Task support for tool requests.
         */tools:looseObject({call:AssertObjectSchema.optional()}).optional()}).optional()});/**
 * Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.
 */const ClientCapabilitiesSchema=object({/**
     * Experimental, non-standard capabilities that the client supports.
     */experimental:record(string(),AssertObjectSchema).optional(),/**
     * Present if the client supports sampling from an LLM.
     */sampling:object({/**
         * Present if the client supports context inclusion via includeContext parameter.
         * If not declared, servers SHOULD only use `includeContext: "none"` (or omit it).
         */context:AssertObjectSchema.optional(),/**
         * Present if the client supports tool use via tools and toolChoice parameters.
         */tools:AssertObjectSchema.optional()}).optional(),/**
     * Present if the client supports eliciting user input.
     */elicitation:ElicitationCapabilitySchema.optional(),/**
     * Present if the client supports listing roots.
     */roots:object({/**
         * Whether the client supports issuing notifications for changes to the roots list.
         */listChanged:boolean().optional()}).optional(),/**
     * Present if the client supports task creation.
     */tasks:ClientTasksCapabilitySchema.optional(),/**
     * Extensions that the client supports. Keys are extension identifiers (vendor-prefix/extension-name).
     */extensions:record(string(),AssertObjectSchema).optional()});const InitializeRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
     */protocolVersion:string(),capabilities:ClientCapabilitiesSchema,clientInfo:ImplementationSchema});/**
 * This request is sent from the client to the server when it first connects, asking it to begin initialization.
 */const InitializeRequestSchema=RequestSchema.extend({method:literal('initialize'),params:InitializeRequestParamsSchema});/**
 * Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.
 */const ServerCapabilitiesSchema=object({/**
     * Experimental, non-standard capabilities that the server supports.
     */experimental:record(string(),AssertObjectSchema).optional(),/**
     * Present if the server supports sending log messages to the client.
     */logging:AssertObjectSchema.optional(),/**
     * Present if the server supports sending completions to the client.
     */completions:AssertObjectSchema.optional(),/**
     * Present if the server offers any prompt templates.
     */prompts:object({/**
         * Whether this server supports issuing notifications for changes to the prompt list.
         */listChanged:boolean().optional()}).optional(),/**
     * Present if the server offers any resources to read.
     */resources:object({/**
         * Whether this server supports clients subscribing to resource updates.
         */subscribe:boolean().optional(),/**
         * Whether this server supports issuing notifications for changes to the resource list.
         */listChanged:boolean().optional()}).optional(),/**
     * Present if the server offers any tools to call.
     */tools:object({/**
         * Whether this server supports issuing notifications for changes to the tool list.
         */listChanged:boolean().optional()}).optional(),/**
     * Present if the server supports task creation.
     */tasks:ServerTasksCapabilitySchema.optional(),/**
     * Extensions that the server supports. Keys are extension identifiers (vendor-prefix/extension-name).
     */extensions:record(string(),AssertObjectSchema).optional()});/**
 * After receiving an initialize request from the client, the server sends this response.
 */const InitializeResultSchema=ResultSchema.extend({/**
     * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
     */protocolVersion:string(),capabilities:ServerCapabilitiesSchema,serverInfo:ImplementationSchema,/**
     * Instructions describing how to use the server and its features.
     *
     * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
     */instructions:string().optional()});/**
 * This notification is sent from the client to the server after initialization has finished.
 */const InitializedNotificationSchema=NotificationSchema.extend({method:literal('notifications/initialized'),params:NotificationsParamsSchema.optional()});/* Ping *//**
 * A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.
 */const PingRequestSchema=RequestSchema.extend({method:literal('ping'),params:BaseRequestParamsSchema.optional()});/* Progress notifications */const ProgressSchema=object({/**
     * The progress thus far. This should increase every time progress is made, even if the total is unknown.
     */progress:number(),/**
     * Total number of items to process (or total progress required), if known.
     */total:optional(number()),/**
     * An optional message describing the current progress.
     */message:optional(string())});const ProgressNotificationParamsSchema=object({...NotificationsParamsSchema.shape,...ProgressSchema.shape,/**
     * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
     */progressToken:ProgressTokenSchema});/**
 * An out-of-band notification used to inform the receiver of a progress update for a long-running request.
 *
 * @category notifications/progress
 */const ProgressNotificationSchema=NotificationSchema.extend({method:literal('notifications/progress'),params:ProgressNotificationParamsSchema});const PaginatedRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */cursor:CursorSchema.optional()});/* Pagination */const PaginatedRequestSchema=RequestSchema.extend({params:PaginatedRequestParamsSchema.optional()});const PaginatedResultSchema=ResultSchema.extend({/**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */nextCursor:CursorSchema.optional()});/**
 * The status of a task.
 * */const TaskStatusSchema=_enum(['working','input_required','completed','failed','cancelled']);/* Tasks *//**
 * A pollable state object associated with a request.
 */const TaskSchema=object({taskId:string(),status:TaskStatusSchema,/**
     * Time in milliseconds to keep task results available after completion.
     * If null, the task has unlimited lifetime until manually cleaned up.
     */ttl:union([number(),_null()]),/**
     * ISO 8601 timestamp when the task was created.
     */createdAt:string(),/**
     * ISO 8601 timestamp when the task was last updated.
     */lastUpdatedAt:string(),pollInterval:optional(number()),/**
     * Optional diagnostic message for failed tasks or other status information.
     */statusMessage:optional(string())});/**
 * Result returned when a task is created, containing the task data wrapped in a task field.
 */const CreateTaskResultSchema=ResultSchema.extend({task:TaskSchema});/**
 * Parameters for task status notification.
 */const TaskStatusNotificationParamsSchema=NotificationsParamsSchema.merge(TaskSchema);/**
 * A notification sent when a task's status changes.
 */const TaskStatusNotificationSchema=NotificationSchema.extend({method:literal('notifications/tasks/status'),params:TaskStatusNotificationParamsSchema});/**
 * A request to get the state of a specific task.
 */const GetTaskRequestSchema=RequestSchema.extend({method:literal('tasks/get'),params:BaseRequestParamsSchema.extend({taskId:string()})});/**
 * The response to a tasks/get request.
 */const GetTaskResultSchema=ResultSchema.merge(TaskSchema);/**
 * A request to get the result of a specific task.
 */const GetTaskPayloadRequestSchema=RequestSchema.extend({method:literal('tasks/result'),params:BaseRequestParamsSchema.extend({taskId:string()})});/**
 * The response to a tasks/result request.
 * The structure matches the result type of the original request.
 * For example, a tools/call task would return the CallToolResult structure.
 *
 */ResultSchema.loose();/**
 * A request to list tasks.
 */const ListTasksRequestSchema=PaginatedRequestSchema.extend({method:literal('tasks/list')});/**
 * The response to a tasks/list request.
 */const ListTasksResultSchema=PaginatedResultSchema.extend({tasks:array(TaskSchema)});/**
 * A request to cancel a specific task.
 */const CancelTaskRequestSchema=RequestSchema.extend({method:literal('tasks/cancel'),params:BaseRequestParamsSchema.extend({taskId:string()})});/**
 * The response to a tasks/cancel request.
 */ResultSchema.merge(TaskSchema);/* Resources *//**
 * The contents of a specific resource or sub-resource.
 */const ResourceContentsSchema=object({/**
     * The URI of this resource.
     */uri:string(),/**
     * The MIME type of this resource, if known.
     */mimeType:optional(string()),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});const TextResourceContentsSchema=ResourceContentsSchema.extend({/**
     * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
     */text:string()});/**
 * A Zod schema for validating Base64 strings that is more performant and
 * robust for very large inputs than the default regex-based check. It avoids
 * stack overflows by using the native `atob` function for validation.
 */const Base64Schema=string().refine(val=>{try{// atob throws a DOMException if the string contains characters
// that are not part of the Base64 character set.
atob(val);return true;}catch{return false;}},{message:'Invalid Base64 string'});const BlobResourceContentsSchema=ResourceContentsSchema.extend({/**
     * A base64-encoded string representing the binary data of the item.
     */blob:Base64Schema});/**
 * The sender or recipient of messages and data in a conversation.
 */const RoleSchema=_enum(['user','assistant']);/**
 * Optional annotations providing clients additional context about a resource.
 */const AnnotationsSchema=object({/**
     * Intended audience(s) for the resource.
     */audience:array(RoleSchema).optional(),/**
     * Importance hint for the resource, from 0 (least) to 1 (most).
     */priority:number().min(0).max(1).optional(),/**
     * ISO 8601 timestamp for the most recent modification.
     */lastModified:datetime({offset:true}).optional()});/**
 * A known resource that the server is capable of reading.
 */const ResourceSchema=object({...BaseMetadataSchema.shape,...IconsSchema.shape,/**
     * The URI of this resource.
     */uri:string(),/**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */description:optional(string()),/**
     * The MIME type of this resource, if known.
     */mimeType:optional(string()),/**
     * The size of the raw resource content, in bytes (i.e., before base64 encoding or any tokenization), if known.
     *
     * This can be used by Hosts to display file sizes and estimate context window usage.
     */size:optional(number()),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:optional(looseObject({}))});/**
 * A template description for resources available on the server.
 */const ResourceTemplateSchema=object({...BaseMetadataSchema.shape,...IconsSchema.shape,/**
     * A URI template (according to RFC 6570) that can be used to construct resource URIs.
     */uriTemplate:string(),/**
     * A description of what this template is for.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */description:optional(string()),/**
     * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
     */mimeType:optional(string()),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:optional(looseObject({}))});/**
 * Sent from the client to request a list of resources the server has.
 */const ListResourcesRequestSchema=PaginatedRequestSchema.extend({method:literal('resources/list')});/**
 * The server's response to a resources/list request from the client.
 */const ListResourcesResultSchema=PaginatedResultSchema.extend({resources:array(ResourceSchema)});/**
 * Sent from the client to request a list of resource templates the server has.
 */const ListResourceTemplatesRequestSchema=PaginatedRequestSchema.extend({method:literal('resources/templates/list')});/**
 * The server's response to a resources/templates/list request from the client.
 */const ListResourceTemplatesResultSchema=PaginatedResultSchema.extend({resourceTemplates:array(ResourceTemplateSchema)});const ResourceRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
     *
     * @format uri
     */uri:string()});/**
 * Parameters for a `resources/read` request.
 */const ReadResourceRequestParamsSchema=ResourceRequestParamsSchema;/**
 * Sent from the client to the server, to read a specific resource URI.
 */const ReadResourceRequestSchema=RequestSchema.extend({method:literal('resources/read'),params:ReadResourceRequestParamsSchema});/**
 * The server's response to a resources/read request from the client.
 */const ReadResourceResultSchema=ResultSchema.extend({contents:array(union([TextResourceContentsSchema,BlobResourceContentsSchema]))});/**
 * An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.
 */const ResourceListChangedNotificationSchema=NotificationSchema.extend({method:literal('notifications/resources/list_changed'),params:NotificationsParamsSchema.optional()});const SubscribeRequestParamsSchema=ResourceRequestParamsSchema;/**
 * Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.
 */const SubscribeRequestSchema=RequestSchema.extend({method:literal('resources/subscribe'),params:SubscribeRequestParamsSchema});const UnsubscribeRequestParamsSchema=ResourceRequestParamsSchema;/**
 * Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.
 */const UnsubscribeRequestSchema=RequestSchema.extend({method:literal('resources/unsubscribe'),params:UnsubscribeRequestParamsSchema});/**
 * Parameters for a `notifications/resources/updated` notification.
 */const ResourceUpdatedNotificationParamsSchema=NotificationsParamsSchema.extend({/**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */uri:string()});/**
 * A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.
 */const ResourceUpdatedNotificationSchema=NotificationSchema.extend({method:literal('notifications/resources/updated'),params:ResourceUpdatedNotificationParamsSchema});/* Prompts *//**
 * Describes an argument that a prompt can accept.
 */const PromptArgumentSchema=object({/**
     * The name of the argument.
     */name:string(),/**
     * A human-readable description of the argument.
     */description:optional(string()),/**
     * Whether this argument must be provided.
     */required:optional(boolean())});/**
 * A prompt or prompt template that the server offers.
 */const PromptSchema=object({...BaseMetadataSchema.shape,...IconsSchema.shape,/**
     * An optional description of what this prompt provides
     */description:optional(string()),/**
     * A list of arguments to use for templating the prompt.
     */arguments:optional(array(PromptArgumentSchema)),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:optional(looseObject({}))});/**
 * Sent from the client to request a list of prompts and prompt templates the server has.
 */const ListPromptsRequestSchema=PaginatedRequestSchema.extend({method:literal('prompts/list')});/**
 * The server's response to a prompts/list request from the client.
 */const ListPromptsResultSchema=PaginatedResultSchema.extend({prompts:array(PromptSchema)});/**
 * Parameters for a `prompts/get` request.
 */const GetPromptRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * The name of the prompt or prompt template.
     */name:string(),/**
     * Arguments to use for templating the prompt.
     */arguments:record(string(),string()).optional()});/**
 * Used by the client to get a prompt provided by the server.
 */const GetPromptRequestSchema=RequestSchema.extend({method:literal('prompts/get'),params:GetPromptRequestParamsSchema});/**
 * Text provided to or from an LLM.
 */const TextContentSchema=object({type:literal('text'),/**
     * The text content of the message.
     */text:string(),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * An image provided to or from an LLM.
 */const ImageContentSchema=object({type:literal('image'),/**
     * The base64-encoded image data.
     */data:Base64Schema,/**
     * The MIME type of the image. Different providers may support different image types.
     */mimeType:string(),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * An Audio provided to or from an LLM.
 */const AudioContentSchema=object({type:literal('audio'),/**
     * The base64-encoded audio data.
     */data:Base64Schema,/**
     * The MIME type of the audio. Different providers may support different audio types.
     */mimeType:string(),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * A tool call request from an assistant (LLM).
 * Represents the assistant's request to use a tool.
 */const ToolUseContentSchema=object({type:literal('tool_use'),/**
     * The name of the tool to invoke.
     * Must match a tool name from the request's tools array.
     */name:string(),/**
     * Unique identifier for this tool call.
     * Used to correlate with ToolResultContent in subsequent messages.
     */id:string(),/**
     * Arguments to pass to the tool.
     * Must conform to the tool's inputSchema.
     */input:record(string(),unknown()),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * The contents of a resource, embedded into a prompt or tool call result.
 */const EmbeddedResourceSchema=object({type:literal('resource'),resource:union([TextResourceContentsSchema,BlobResourceContentsSchema]),/**
     * Optional annotations for the client.
     */annotations:AnnotationsSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 *
 * Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
 */const ResourceLinkSchema=ResourceSchema.extend({type:literal('resource_link')});/**
 * A content block that can be used in prompts and tool results.
 */const ContentBlockSchema=union([TextContentSchema,ImageContentSchema,AudioContentSchema,ResourceLinkSchema,EmbeddedResourceSchema]);/**
 * Describes a message returned as part of a prompt.
 */const PromptMessageSchema=object({role:RoleSchema,content:ContentBlockSchema});/**
 * The server's response to a prompts/get request from the client.
 */const GetPromptResultSchema=ResultSchema.extend({/**
     * An optional description for the prompt.
     */description:string().optional(),messages:array(PromptMessageSchema)});/**
 * An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.
 */const PromptListChangedNotificationSchema=NotificationSchema.extend({method:literal('notifications/prompts/list_changed'),params:NotificationsParamsSchema.optional()});/* Tools *//**
 * Additional properties describing a Tool to clients.
 *
 * NOTE: all properties in ToolAnnotations are **hints**.
 * They are not guaranteed to provide a faithful description of
 * tool behavior (including descriptive properties like `title`).
 *
 * Clients should never make tool use decisions based on ToolAnnotations
 * received from untrusted servers.
 */const ToolAnnotationsSchema=object({/**
     * A human-readable title for the tool.
     */title:string().optional(),/**
     * If true, the tool does not modify its environment.
     *
     * Default: false
     */readOnlyHint:boolean().optional(),/**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: true
     */destructiveHint:boolean().optional(),/**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: false
     */idempotentHint:boolean().optional(),/**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: true
     */openWorldHint:boolean().optional()});/**
 * Execution-related properties for a tool.
 */const ToolExecutionSchema=object({/**
     * Indicates the tool's preference for task-augmented execution.
     * - "required": Clients MUST invoke the tool as a task
     * - "optional": Clients MAY invoke the tool as a task or normal request
     * - "forbidden": Clients MUST NOT attempt to invoke the tool as a task
     *
     * If not present, defaults to "forbidden".
     */taskSupport:_enum(['required','optional','forbidden']).optional()});/**
 * Definition for a tool the client can call.
 */const ToolSchema=object({...BaseMetadataSchema.shape,...IconsSchema.shape,/**
     * A human-readable description of the tool.
     */description:string().optional(),/**
     * A JSON Schema 2020-12 object defining the expected parameters for the tool.
     * Must have type: 'object' at the root level per MCP spec.
     */inputSchema:object({type:literal('object'),properties:record(string(),AssertObjectSchema).optional(),required:array(string()).optional()}).catchall(unknown()),/**
     * An optional JSON Schema 2020-12 object defining the structure of the tool's output
     * returned in the structuredContent field of a CallToolResult.
     * Must have type: 'object' at the root level per MCP spec.
     */outputSchema:object({type:literal('object'),properties:record(string(),AssertObjectSchema).optional(),required:array(string()).optional()}).catchall(unknown()).optional(),/**
     * Optional additional tool information.
     */annotations:ToolAnnotationsSchema.optional(),/**
     * Execution-related properties for this tool.
     */execution:ToolExecutionSchema.optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * Sent from the client to request a list of tools the server has.
 */const ListToolsRequestSchema=PaginatedRequestSchema.extend({method:literal('tools/list')});/**
 * The server's response to a tools/list request from the client.
 */const ListToolsResultSchema=PaginatedResultSchema.extend({tools:array(ToolSchema)});/**
 * The server's response to a tool call.
 */const CallToolResultSchema=ResultSchema.extend({/**
     * A list of content objects that represent the result of the tool call.
     *
     * If the Tool does not define an outputSchema, this field MUST be present in the result.
     * For backwards compatibility, this field is always present, but it may be empty.
     */content:array(ContentBlockSchema).default([]),/**
     * An object containing structured tool output.
     *
     * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
     */structuredContent:record(string(),unknown()).optional(),/**
     * Whether the tool call ended in an error.
     *
     * If not set, this is assumed to be false (the call was successful).
     *
     * Any errors that originate from the tool SHOULD be reported inside the result
     * object, with `isError` set to true, _not_ as an MCP protocol-level error
     * response. Otherwise, the LLM would not be able to see that an error occurred
     * and self-correct.
     *
     * However, any errors in _finding_ the tool, an error indicating that the
     * server does not support tool calls, or any other exceptional conditions,
     * should be reported as an MCP error response.
     */isError:boolean().optional()});/**
 * CallToolResultSchema extended with backwards compatibility to protocol version 2024-10-07.
 */CallToolResultSchema.or(ResultSchema.extend({toolResult:unknown()}));/**
 * Parameters for a `tools/call` request.
 */const CallToolRequestParamsSchema=TaskAugmentedRequestParamsSchema.extend({/**
     * The name of the tool to call.
     */name:string(),/**
     * Arguments to pass to the tool.
     */arguments:record(string(),unknown()).optional()});/**
 * Used by the client to invoke a tool provided by the server.
 */const CallToolRequestSchema=RequestSchema.extend({method:literal('tools/call'),params:CallToolRequestParamsSchema});/**
 * An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.
 */const ToolListChangedNotificationSchema=NotificationSchema.extend({method:literal('notifications/tools/list_changed'),params:NotificationsParamsSchema.optional()});/**
 * Base schema for list changed subscription options (without callback).
 * Used internally for Zod validation of autoRefresh and debounceMs.
 */object({/**
     * If true, the list will be refreshed automatically when a list changed notification is received.
     * The callback will be called with the updated list.
     *
     * If false, the callback will be called with null items, allowing manual refresh.
     *
     * @default true
     */autoRefresh:boolean().default(true),/**
     * Debounce time in milliseconds for list changed notification processing.
     *
     * Multiple notifications received within this timeframe will only trigger one refresh.
     * Set to 0 to disable debouncing.
     *
     * @default 300
     */debounceMs:number().int().nonnegative().default(300)});/* Logging *//**
 * The severity of a log message.
 */const LoggingLevelSchema=_enum(['debug','info','notice','warning','error','critical','alert','emergency']);/**
 * Parameters for a `logging/setLevel` request.
 */const SetLevelRequestParamsSchema=BaseRequestParamsSchema.extend({/**
     * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
     */level:LoggingLevelSchema});/**
 * A request from the client to the server, to enable or adjust logging.
 */const SetLevelRequestSchema=RequestSchema.extend({method:literal('logging/setLevel'),params:SetLevelRequestParamsSchema});/**
 * Parameters for a `notifications/message` notification.
 */const LoggingMessageNotificationParamsSchema=NotificationsParamsSchema.extend({/**
     * The severity of this log message.
     */level:LoggingLevelSchema,/**
     * An optional name of the logger issuing this message.
     */logger:string().optional(),/**
     * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
     */data:unknown()});/**
 * Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.
 */const LoggingMessageNotificationSchema=NotificationSchema.extend({method:literal('notifications/message'),params:LoggingMessageNotificationParamsSchema});/* Sampling *//**
 * Hints to use for model selection.
 */const ModelHintSchema=object({/**
     * A hint for a model name.
     */name:string().optional()});/**
 * The server's preferences for model selection, requested of the client during sampling.
 */const ModelPreferencesSchema=object({/**
     * Optional hints to use for model selection.
     */hints:array(ModelHintSchema).optional(),/**
     * How much to prioritize cost when selecting a model.
     */costPriority:number().min(0).max(1).optional(),/**
     * How much to prioritize sampling speed (latency) when selecting a model.
     */speedPriority:number().min(0).max(1).optional(),/**
     * How much to prioritize intelligence and capabilities when selecting a model.
     */intelligencePriority:number().min(0).max(1).optional()});/**
 * Controls tool usage behavior in sampling requests.
 */const ToolChoiceSchema=object({/**
     * Controls when tools are used:
     * - "auto": Model decides whether to use tools (default)
     * - "required": Model MUST use at least one tool before completing
     * - "none": Model MUST NOT use any tools
     */mode:_enum(['auto','required','none']).optional()});/**
 * The result of a tool execution, provided by the user (server).
 * Represents the outcome of invoking a tool requested via ToolUseContent.
 */const ToolResultContentSchema=object({type:literal('tool_result'),toolUseId:string().describe('The unique identifier for the corresponding tool call.'),content:array(ContentBlockSchema).default([]),structuredContent:object({}).loose().optional(),isError:boolean().optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * Basic content types for sampling responses (without tool use).
 * Used for backwards-compatible CreateMessageResult when tools are not used.
 */const SamplingContentSchema=discriminatedUnion('type',[TextContentSchema,ImageContentSchema,AudioContentSchema]);/**
 * Content block types allowed in sampling messages.
 * This includes text, image, audio, tool use requests, and tool results.
 */const SamplingMessageContentBlockSchema=discriminatedUnion('type',[TextContentSchema,ImageContentSchema,AudioContentSchema,ToolUseContentSchema,ToolResultContentSchema]);/**
 * Describes a message issued to or received from an LLM API.
 */const SamplingMessageSchema=object({role:RoleSchema,content:union([SamplingMessageContentBlockSchema,array(SamplingMessageContentBlockSchema)]),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * Parameters for a `sampling/createMessage` request.
 */const CreateMessageRequestParamsSchema=TaskAugmentedRequestParamsSchema.extend({messages:array(SamplingMessageSchema),/**
     * The server's preferences for which model to select. The client MAY modify or omit this request.
     */modelPreferences:ModelPreferencesSchema.optional(),/**
     * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
     */systemPrompt:string().optional(),/**
     * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt.
     * The client MAY ignore this request.
     *
     * Default is "none". Values "thisServer" and "allServers" are soft-deprecated. Servers SHOULD only use these values if the client
     * declares ClientCapabilities.sampling.context. These values may be removed in future spec releases.
     */includeContext:_enum(['none','thisServer','allServers']).optional(),temperature:number().optional(),/**
     * The requested maximum number of tokens to sample (to prevent runaway completions).
     *
     * The client MAY choose to sample fewer tokens than the requested maximum.
     */maxTokens:number().int(),stopSequences:array(string()).optional(),/**
     * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
     */metadata:AssertObjectSchema.optional(),/**
     * Tools that the model may use during generation.
     * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
     */tools:array(ToolSchema).optional(),/**
     * Controls how the model uses tools.
     * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
     * Default is `{ mode: "auto" }`.
     */toolChoice:ToolChoiceSchema.optional()});/**
 * A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.
 */const CreateMessageRequestSchema=RequestSchema.extend({method:literal('sampling/createMessage'),params:CreateMessageRequestParamsSchema});/**
 * The client's response to a sampling/create_message request from the server.
 * This is the backwards-compatible version that returns single content (no arrays).
 * Used when the request does not include tools.
 */const CreateMessageResultSchema=ResultSchema.extend({/**
     * The name of the model that generated the message.
     */model:string(),/**
     * The reason why sampling stopped, if known.
     *
     * Standard values:
     * - "endTurn": Natural end of the assistant's turn
     * - "stopSequence": A stop sequence was encountered
     * - "maxTokens": Maximum token limit was reached
     *
     * This field is an open string to allow for provider-specific stop reasons.
     */stopReason:optional(_enum(['endTurn','stopSequence','maxTokens']).or(string())),role:RoleSchema,/**
     * Response content. Single content block (text, image, or audio).
     */content:SamplingContentSchema});/**
 * The client's response to a sampling/create_message request when tools were provided.
 * This version supports array content for tool use flows.
 */const CreateMessageResultWithToolsSchema=ResultSchema.extend({/**
     * The name of the model that generated the message.
     */model:string(),/**
     * The reason why sampling stopped, if known.
     *
     * Standard values:
     * - "endTurn": Natural end of the assistant's turn
     * - "stopSequence": A stop sequence was encountered
     * - "maxTokens": Maximum token limit was reached
     * - "toolUse": The model wants to use one or more tools
     *
     * This field is an open string to allow for provider-specific stop reasons.
     */stopReason:optional(_enum(['endTurn','stopSequence','maxTokens','toolUse']).or(string())),role:RoleSchema,/**
     * Response content. May be a single block or array. May include ToolUseContent if stopReason is "toolUse".
     */content:union([SamplingMessageContentBlockSchema,array(SamplingMessageContentBlockSchema)])});/* Elicitation *//**
 * Primitive schema definition for boolean fields.
 */const BooleanSchemaSchema=object({type:literal('boolean'),title:string().optional(),description:string().optional(),default:boolean().optional()});/**
 * Primitive schema definition for string fields.
 */const StringSchemaSchema=object({type:literal('string'),title:string().optional(),description:string().optional(),minLength:number().optional(),maxLength:number().optional(),format:_enum(['email','uri','date','date-time']).optional(),default:string().optional()});/**
 * Primitive schema definition for number fields.
 */const NumberSchemaSchema=object({type:_enum(['number','integer']),title:string().optional(),description:string().optional(),minimum:number().optional(),maximum:number().optional(),default:number().optional()});/**
 * Schema for single-selection enumeration without display titles for options.
 */const UntitledSingleSelectEnumSchemaSchema=object({type:literal('string'),title:string().optional(),description:string().optional(),enum:array(string()),default:string().optional()});/**
 * Schema for single-selection enumeration with display titles for each option.
 */const TitledSingleSelectEnumSchemaSchema=object({type:literal('string'),title:string().optional(),description:string().optional(),oneOf:array(object({const:string(),title:string()})),default:string().optional()});/**
 * Use TitledSingleSelectEnumSchema instead.
 * This interface will be removed in a future version.
 */const LegacyTitledEnumSchemaSchema=object({type:literal('string'),title:string().optional(),description:string().optional(),enum:array(string()),enumNames:array(string()).optional(),default:string().optional()});// Combined single selection enumeration
const SingleSelectEnumSchemaSchema=union([UntitledSingleSelectEnumSchemaSchema,TitledSingleSelectEnumSchemaSchema]);/**
 * Schema for multiple-selection enumeration without display titles for options.
 */const UntitledMultiSelectEnumSchemaSchema=object({type:literal('array'),title:string().optional(),description:string().optional(),minItems:number().optional(),maxItems:number().optional(),items:object({type:literal('string'),enum:array(string())}),default:array(string()).optional()});/**
 * Schema for multiple-selection enumeration with display titles for each option.
 */const TitledMultiSelectEnumSchemaSchema=object({type:literal('array'),title:string().optional(),description:string().optional(),minItems:number().optional(),maxItems:number().optional(),items:object({anyOf:array(object({const:string(),title:string()}))}),default:array(string()).optional()});/**
 * Combined schema for multiple-selection enumeration
 */const MultiSelectEnumSchemaSchema=union([UntitledMultiSelectEnumSchemaSchema,TitledMultiSelectEnumSchemaSchema]);/**
 * Primitive schema definition for enum fields.
 */const EnumSchemaSchema=union([LegacyTitledEnumSchemaSchema,SingleSelectEnumSchemaSchema,MultiSelectEnumSchemaSchema]);/**
 * Union of all primitive schema definitions.
 */const PrimitiveSchemaDefinitionSchema=union([EnumSchemaSchema,BooleanSchemaSchema,StringSchemaSchema,NumberSchemaSchema]);/**
 * Parameters for an `elicitation/create` request for form-based elicitation.
 */const ElicitRequestFormParamsSchema=TaskAugmentedRequestParamsSchema.extend({/**
     * The elicitation mode.
     *
     * Optional for backward compatibility. Clients MUST treat missing mode as "form".
     */mode:literal('form').optional(),/**
     * The message to present to the user describing what information is being requested.
     */message:string(),/**
     * A restricted subset of JSON Schema.
     * Only top-level properties are allowed, without nesting.
     */requestedSchema:object({type:literal('object'),properties:record(string(),PrimitiveSchemaDefinitionSchema),required:array(string()).optional()})});/**
 * Parameters for an `elicitation/create` request for URL-based elicitation.
 */const ElicitRequestURLParamsSchema=TaskAugmentedRequestParamsSchema.extend({/**
     * The elicitation mode.
     */mode:literal('url'),/**
     * The message to present to the user explaining why the interaction is needed.
     */message:string(),/**
     * The ID of the elicitation, which must be unique within the context of the server.
     * The client MUST treat this ID as an opaque value.
     */elicitationId:string(),/**
     * The URL that the user should navigate to.
     */url:string().url()});/**
 * The parameters for a request to elicit additional information from the user via the client.
 */const ElicitRequestParamsSchema=union([ElicitRequestFormParamsSchema,ElicitRequestURLParamsSchema]);/**
 * A request from the server to elicit user input via the client.
 * The client should present the message and form fields to the user (form mode)
 * or navigate to a URL (URL mode).
 */const ElicitRequestSchema=RequestSchema.extend({method:literal('elicitation/create'),params:ElicitRequestParamsSchema});/**
 * Parameters for a `notifications/elicitation/complete` notification.
 *
 * @category notifications/elicitation/complete
 */const ElicitationCompleteNotificationParamsSchema=NotificationsParamsSchema.extend({/**
     * The ID of the elicitation that completed.
     */elicitationId:string()});/**
 * A notification from the server to the client, informing it of a completion of an out-of-band elicitation request.
 *
 * @category notifications/elicitation/complete
 */const ElicitationCompleteNotificationSchema=NotificationSchema.extend({method:literal('notifications/elicitation/complete'),params:ElicitationCompleteNotificationParamsSchema});/**
 * The client's response to an elicitation/create request from the server.
 */const ElicitResultSchema=ResultSchema.extend({/**
     * The user action in response to the elicitation.
     * - "accept": User submitted the form/confirmed the action
     * - "decline": User explicitly decline the action
     * - "cancel": User dismissed without making an explicit choice
     */action:_enum(['accept','decline','cancel']),/**
     * The submitted form data, only present when action is "accept".
     * Contains values matching the requested schema.
     * Per MCP spec, content is "typically omitted" for decline/cancel actions.
     * We normalize null to undefined for leniency while maintaining type compatibility.
     */content:preprocess(val=>val===null?undefined:val,record(string(),union([string(),number(),boolean(),array(string())])).optional())});/* Autocomplete *//**
 * A reference to a resource or resource template definition.
 */const ResourceTemplateReferenceSchema=object({type:literal('ref/resource'),/**
     * The URI or URI template of the resource.
     */uri:string()});/**
 * Identifies a prompt.
 */const PromptReferenceSchema=object({type:literal('ref/prompt'),/**
     * The name of the prompt or prompt template
     */name:string()});/**
 * Parameters for a `completion/complete` request.
 */const CompleteRequestParamsSchema=BaseRequestParamsSchema.extend({ref:union([PromptReferenceSchema,ResourceTemplateReferenceSchema]),/**
     * The argument's information
     */argument:object({/**
         * The name of the argument
         */name:string(),/**
         * The value of the argument to use for completion matching.
         */value:string()}),context:object({/**
         * Previously-resolved variables in a URI template or prompt.
         */arguments:record(string(),string()).optional()}).optional()});/**
 * A request from the client to the server, to ask for completion options.
 */const CompleteRequestSchema=RequestSchema.extend({method:literal('completion/complete'),params:CompleteRequestParamsSchema});/**
 * The server's response to a completion/complete request
 */const CompleteResultSchema=ResultSchema.extend({completion:looseObject({/**
         * An array of completion values. Must not exceed 100 items.
         */values:array(string()).max(100),/**
         * The total number of completion options available. This can exceed the number of values actually sent in the response.
         */total:optional(number().int()),/**
         * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
         */hasMore:optional(boolean())})});/* Roots *//**
 * Represents a root directory or file that the server can operate on.
 */const RootSchema=object({/**
     * The URI identifying the root. This *must* start with file:// for now.
     */uri:string().startsWith('file://'),/**
     * An optional name for the root.
     */name:string().optional(),/**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */_meta:record(string(),unknown()).optional()});/**
 * Sent from the server to request a list of root URIs from the client.
 */const ListRootsRequestSchema=RequestSchema.extend({method:literal('roots/list'),params:BaseRequestParamsSchema.optional()});/**
 * The client's response to a roots/list request from the server.
 */const ListRootsResultSchema=ResultSchema.extend({roots:array(RootSchema)});/**
 * A notification from the client to the server, informing it that the list of roots has changed.
 */const RootsListChangedNotificationSchema=NotificationSchema.extend({method:literal('notifications/roots/list_changed'),params:NotificationsParamsSchema.optional()});/* Client messages */union([PingRequestSchema,InitializeRequestSchema,CompleteRequestSchema,SetLevelRequestSchema,GetPromptRequestSchema,ListPromptsRequestSchema,ListResourcesRequestSchema,ListResourceTemplatesRequestSchema,ReadResourceRequestSchema,SubscribeRequestSchema,UnsubscribeRequestSchema,CallToolRequestSchema,ListToolsRequestSchema,GetTaskRequestSchema,GetTaskPayloadRequestSchema,ListTasksRequestSchema,CancelTaskRequestSchema]);union([CancelledNotificationSchema,ProgressNotificationSchema,InitializedNotificationSchema,RootsListChangedNotificationSchema,TaskStatusNotificationSchema]);union([EmptyResultSchema,CreateMessageResultSchema,CreateMessageResultWithToolsSchema,ElicitResultSchema,ListRootsResultSchema,GetTaskResultSchema,ListTasksResultSchema,CreateTaskResultSchema]);/* Server messages */union([PingRequestSchema,CreateMessageRequestSchema,ElicitRequestSchema,ListRootsRequestSchema,GetTaskRequestSchema,GetTaskPayloadRequestSchema,ListTasksRequestSchema,CancelTaskRequestSchema]);union([CancelledNotificationSchema,ProgressNotificationSchema,LoggingMessageNotificationSchema,ResourceUpdatedNotificationSchema,ResourceListChangedNotificationSchema,ToolListChangedNotificationSchema,PromptListChangedNotificationSchema,TaskStatusNotificationSchema,ElicitationCompleteNotificationSchema]);union([EmptyResultSchema,InitializeResultSchema,CompleteResultSchema,GetPromptResultSchema,ListPromptsResultSchema,ListResourcesResultSchema,ListResourceTemplatesResultSchema,ReadResourceResultSchema,CallToolResultSchema,ListToolsResultSchema,GetTaskResultSchema,ListTasksResultSchema,CreateTaskResultSchema]);

/**
 * Buffers a continuous stdio stream into discrete JSON-RPC messages.
 */class ReadBuffer{append(chunk){this._buffer=this._buffer?Buffer.concat([this._buffer,chunk]):chunk;}readMessage(){if(!this._buffer){return null;}const index=this._buffer.indexOf('\n');if(index===-1){return null;}const line=this._buffer.toString('utf8',0,index).replace(/\r$/,'');this._buffer=this._buffer.subarray(index+1);return deserializeMessage(line);}clear(){this._buffer=undefined;}}function deserializeMessage(line){return JSONRPCMessageSchema.parse(JSON.parse(line));}function serializeMessage(message){return JSON.stringify(message)+'\n';}

/**
 * Environment variables to inherit by default, if an environment is not explicitly given.
 */const DEFAULT_INHERITED_ENV_VARS=process$2.platform==='win32'?['APPDATA','HOMEDRIVE','HOMEPATH','LOCALAPPDATA','PATH','PROCESSOR_ARCHITECTURE','SYSTEMDRIVE','SYSTEMROOT','TEMP','USERNAME','USERPROFILE','PROGRAMFILES']:/* list inspired by the default env inheritance of sudo */['HOME','LOGNAME','PATH','SHELL','TERM','USER'];/**
 * Returns a default environment object including only environment variables deemed safe to inherit.
 */function getDefaultEnvironment(){const env={};for(const key of DEFAULT_INHERITED_ENV_VARS){const value=process$2.env[key];if(value===undefined){continue;}if(value.startsWith('()')){// Skip functions, which are a security risk.
continue;}env[key]=value;}return env;}/**
 * Client transport for stdio: this will connect to a server by spawning a process and communicating with it over stdin/stdout.
 *
 * This transport is only available in Node.js environments.
 */class StdioClientTransport{constructor(server){this._readBuffer=new ReadBuffer();this._stderrStream=null;this._serverParams=server;if(server.stderr==='pipe'||server.stderr==='overlapped'){this._stderrStream=new node_stream.PassThrough();}}/**
     * Starts the server process and prepares to communicate with it.
     */async start(){if(this._process){throw new Error('StdioClientTransport already started! If using Client class, note that connect() calls start() automatically.');}return new Promise((resolve,reject)=>{this._process=spawn(this._serverParams.command,this._serverParams.args??[],{// merge default env with server env because mcp server needs some env vars
env:{...getDefaultEnvironment(),...this._serverParams.env},stdio:['pipe','pipe',this._serverParams.stderr??'inherit'],shell:false,windowsHide:process$2.platform==='win32',cwd:this._serverParams.cwd});this._process.on('error',error=>{reject(error);this.onerror?.(error);});this._process.on('spawn',()=>{resolve();});this._process.on('close',_code=>{this._process=undefined;this.onclose?.();});this._process.stdin?.on('error',error=>{this.onerror?.(error);});this._process.stdout?.on('data',chunk=>{this._readBuffer.append(chunk);this.processReadBuffer();});this._process.stdout?.on('error',error=>{this.onerror?.(error);});if(this._stderrStream&&this._process.stderr){this._process.stderr.pipe(this._stderrStream);}});}/**
     * The stderr stream of the child process, if `StdioServerParameters.stderr` was set to "pipe" or "overlapped".
     *
     * If stderr piping was requested, a PassThrough stream is returned _immediately_, allowing callers to
     * attach listeners before the start method is invoked. This prevents loss of any early
     * error output emitted by the child process.
     */get stderr(){if(this._stderrStream){return this._stderrStream;}return this._process?.stderr??null;}/**
     * The child process pid spawned by this transport.
     *
     * This is only available after the transport has been started.
     */get pid(){return this._process?.pid??null;}processReadBuffer(){while(true){try{const message=this._readBuffer.readMessage();if(message===null){break;}this.onmessage?.(message);}catch(error){this.onerror?.(error);}}}async close(){if(this._process){const processToClose=this._process;this._process=undefined;const closePromise=new Promise(resolve=>{processToClose.once('close',()=>{resolve();});});try{processToClose.stdin?.end();}catch{// ignore
}await Promise.race([closePromise,new Promise(resolve=>setTimeout(resolve,2000).unref())]);if(processToClose.exitCode===null){try{processToClose.kill('SIGTERM');}catch{// ignore
}await Promise.race([closePromise,new Promise(resolve=>setTimeout(resolve,2000).unref())]);}if(processToClose.exitCode===null){try{processToClose.kill('SIGKILL');}catch{// ignore
}}}this._readBuffer.clear();}send(message){return new Promise(resolve=>{if(!this._process?.stdin){throw new Error('Not connected');}const json=serializeMessage(message);if(this._process.stdin.write(json)){resolve();}else {this._process.stdin.once('drain',resolve);}});}}

/** 共用 direct MCP URL 语法校验，不限制主机名或地址范围。 */
function parseMcpDirectUrl(rawUrl) {
    try {
        const url = new URL(rawUrl);
        if ((url.protocol !== 'http:' && url.protocol !== 'https:')
            || !url.hostname || url.username || url.password || url.hash)
            return undefined;
        return url;
    }
    catch {
        return undefined;
    }
}

const MAX_STRING_LENGTH = 4_000;
const MAX_ARRAY_ITEMS = 100;
const MAX_DEPTH = 10;
const MAX_SCHEMA_DEPTH = 32;
const SECRET_KEY_PATTERN = /authorization|api[-_]?key|token|secret|password|cookie|client[-_]?secret|code[-_]?verifier/i;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
/**
 * 按统一字符串预算截断文本。
 *
 * @param value 原始文本。
 * @returns 截断后的文本。
 */
function truncate(value) {
    return value.length <= MAX_STRING_LENGTH
        ? value
        : `${value.slice(0, MAX_STRING_LENGTH)}...[truncated]`;
}
/**
 * 替换显式配置敏感值和常见 Bearer 凭证。
 *
 * @param value 待脱敏文本。
 * @param secrets 需要屏蔽的敏感值集合。
 * @returns 已脱敏且有界的文本。
 */
function redactText(value, secrets = []) {
    let result = value.replace(BEARER_PATTERN, "Bearer [REDACTED]");
    for (const secret of secrets) {
        if (secret.length >= 3) {
            result = result.split(secret).join("[REDACTED]");
        }
    }
    return truncate(result);
}
/**
 * 生成可 JSON 序列化、深度有界且敏感字段已屏蔽的值。
 *
 * @param value 待脱敏的未知值。
 * @param secrets 需要屏蔽的敏感值集合。
 * @param depth 当前递归深度。
 * @param seen 循环引用检测集合。
 * @returns 可穿过 helper RPC 边界的脱敏值。
 */
function sanitizeSerializable(value, secrets = [], depth = 0, seen = new WeakSet()) {
    if (value == null || typeof value === "boolean" || typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        return redactText(value, secrets);
    }
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "undefined") {
        return undefined;
    }
    if (depth >= MAX_DEPTH) {
        return "[truncated]";
    }
    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeSerializable(item, secrets, depth + 1, seen));
    }
    if (typeof value === "object") {
        if (seen.has(value)) {
            return "[circular]";
        }
        seen.add(value);
        const result = {};
        for (const [key, item] of Object.entries(value).slice(0, MAX_ARRAY_ITEMS)) {
            if (SECRET_KEY_PATTERN.test(key)) {
                result[key] = "[REDACTED]";
                continue;
            }
            const sanitized = sanitizeSerializable(item, secrets, depth + 1, seen);
            if (sanitized !== undefined) {
                result[key] = sanitized;
            }
        }
        seen.delete(value);
        return result;
    }
    return String(value);
}
/**
 * 脱敏模型可见 JSON Schema，并避免用字符串标记破坏 provider 工具定义结构。
 *
 * @param value 待脱敏的 JSON Schema 值。
 * @param secrets 需要屏蔽的敏感值集合。
 * @param depth 当前递归深度。
 * @param seen 循环引用检测集合。
 * @returns 可用于模型工具定义的脱敏 Schema。
 */
function sanitizeJsonSchemaSerializable(value, secrets = [], depth = 0, seen = new WeakSet()) {
    if (value == null || typeof value === "boolean" || typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        return redactText(value, secrets);
    }
    if (typeof value === "bigint") {
        return value.toString();
    }
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "undefined") {
        return undefined;
    }
    if (depth >= MAX_SCHEMA_DEPTH) {
        return {};
    }
    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeJsonSchemaSerializable(item, secrets, depth + 1, seen));
    }
    if (typeof value === "object") {
        if (seen.has(value)) {
            return {};
        }
        seen.add(value);
        const result = {};
        for (const [key, item] of Object.entries(value).slice(0, MAX_ARRAY_ITEMS)) {
            const sanitized = sanitizeJsonSchemaSerializable(item, secrets, depth + 1, seen);
            if (sanitized !== undefined) {
                result[key] = sanitized;
            }
        }
        seen.delete(value);
        return result;
    }
    return String(value);
}
/**
 * 提取绝不能穿过 helper RPC 边界的配置敏感值。
 *
 * @param config MCP 服务配置中的 env 与 headers 片段。
 * @returns 非空敏感值列表。
 */
function collectConfigSecrets(config) {
    return [
        ...Object.values(config.env ?? {}),
        ...Object.values(config.headers ?? {}),
    ].filter((value) => value.length > 0);
}

const MAX_DIAGNOSTIC_BYTES = 8 * 1024;
const MAX_DIAGNOSTIC_ENTRIES = 40;
const MAX_ENTRY_BYTES = 2 * 1024;
const ANSI_OSC_PATTERN = /\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g;
const ANSI_ESCAPE_PATTERN = /\u001B(?:\[[0-?]*[ -/]*[@-~]|[@-_])/g;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const clientDiagnostics = new WeakMap();
/**
 * 按 UTF-8 字节预算截断诊断文本，避免切断多字节字符后产生异常文本。
 *
 * @param value 原始诊断文本。
 * @param maxBytes 最大字节数。
 * @returns 截断后的诊断文本。
 */
function truncateUtf8(value, maxBytes) {
    if (Buffer.byteLength(value) <= maxBytes)
        return value;
    const suffix = "...[truncated]";
    const prefixBudget = Math.max(0, maxBytes - Buffer.byteLength(suffix));
    const bytes = Buffer.from(value);
    let end = Math.min(prefixBudget, bytes.length);
    let prefix = bytes.subarray(0, end).toString("utf8");
    while (end > 0 && Buffer.byteLength(prefix) > prefixBudget) {
        end -= 1;
        prefix = bytes.subarray(0, end).toString("utf8");
    }
    return `${prefix}${suffix}`;
}
/**
 * 清理单行 stderr 诊断文本，删除控制字符并屏蔽已知敏感值。
 *
 * @param value 原始 stderr 行。
 * @param secrets 需要屏蔽的敏感值集合。
 * @returns 可进入 helper 诊断快照的单行文本。
 */
function sanitizeLine(value, secrets) {
    return redactText(value
        .replace(ANSI_OSC_PATTERN, "")
        .replace(ANSI_ESCAPE_PATTERN, "")
        .replace(CONTROL_CHARACTER_PATTERN, "")
        .replace(/\t/g, " ")
        .trim(), secrets);
}
/**
 * 捕获协议流之外的 stderr 诊断，并避免对 MCP transport 施加背压。
 *
 * @param stream stdio transport 暴露的 stderr 数据流。
 * @param secrets 需要从诊断中屏蔽的敏感值集合。
 * @returns 可快照和释放的 client 诊断对象。
 */
function createStderrDiagnostics(stream, secrets) {
    const entries = [];
    let totalBytes = 0;
    let droppedEntries = 0;
    let disposed = false;
    /**
     * 追加一条有界诊断行，并在总预算超限时丢弃最早记录。
     *
     * @param value 已清理的诊断行。
     */
    const append = (value) => {
        const entry = truncateUtf8(value, MAX_ENTRY_BYTES);
        if (!entry)
            return;
        entries.push(entry);
        totalBytes += Buffer.byteLength(entry);
        while (entries.length > MAX_DIAGNOSTIC_ENTRIES || totalBytes > MAX_DIAGNOSTIC_BYTES) {
            const removed = entries.shift();
            if (removed === undefined)
                break;
            totalBytes -= Buffer.byteLength(removed);
            droppedEntries += 1;
        }
    };
    /**
     * 处理 stderr 数据块，按行清理并更新诊断环形快照。
     *
     * @param chunk stderr data 事件中的未知数据块。
     */
    const onData = (chunk) => {
        if (disposed)
            return;
        const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
        const wasChunkTruncated = chunkBuffer.length > MAX_DIAGNOSTIC_BYTES;
        const boundedChunk = wasChunkTruncated
            ? chunkBuffer.subarray(chunkBuffer.length - MAX_DIAGNOSTIC_BYTES)
            : chunkBuffer;
        const text = boundedChunk.toString("utf8");
        if (wasChunkTruncated) {
            droppedEntries += 1;
        }
        for (const rawLine of text.split(/\r\n|\n|\r/)) {
            append(sanitizeLine(rawLine, secrets));
        }
    };
    stream.on("data", onData);
    return {
        snapshot: () => {
            if (disposed)
                return [];
            const snapshot = [...entries];
            if (droppedEntries === 0)
                return snapshot;
            const marker = `[stderr truncated: ${droppedEntries} earlier entries omitted]`;
            let snapshotBytes = snapshot.reduce((sum, entry) => sum + Buffer.byteLength(entry), 0);
            while (snapshot.length >= MAX_DIAGNOSTIC_ENTRIES ||
                snapshotBytes + Buffer.byteLength(marker) > MAX_DIAGNOSTIC_BYTES) {
                const removed = snapshot.shift();
                if (removed === undefined)
                    break;
                snapshotBytes -= Buffer.byteLength(removed);
            }
            return [marker, ...snapshot];
        },
        dispose: () => {
            if (disposed)
                return;
            disposed = true;
            stream.removeListener("data", onData);
            entries.length = 0;
            totalBytes = 0;
            droppedEntries = 0;
        },
    };
}
/**
 * 绑定 MCP client 与 stderr 诊断对象，替换旧绑定时会先释放旧诊断。
 *
 * @param client helper 内部 MCP client。
 * @param diagnostics 新的诊断对象。
 */
function registerClientDiagnostics(client, diagnostics) {
    clientDiagnostics.get(client)?.dispose();
    clientDiagnostics.set(client, diagnostics);
}
/**
 * 读取 MCP client 当前 stderr 诊断快照。
 *
 * @param client helper 内部 MCP client；为空时返回空列表。
 * @returns 有界且已脱敏的诊断行。
 */
function readClientDiagnostics(client) {
    return client ? clientDiagnostics.get(client)?.snapshot() ?? [] : [];
}
/**
 * 释放 MCP client 关联的 stderr 诊断对象。
 *
 * @param client helper 内部 MCP client；为空时不执行操作。
 */
function disposeClientDiagnostics(client) {
    if (!client)
        return;
    clientDiagnostics.get(client)?.dispose();
    clientDiagnostics.delete(client);
}

/**
 * 带稳定错误码的 helper 错误，消息必须适合穿过私有 RPC 边界。
 */
class McpHelperError extends Error {
    errorCode;
    /**
     * 创建 helper 边界错误。
     *
     * @param errorCode 稳定错误码。
     * @param message 已脱敏或不含敏感信息的错误消息。
     */
    constructor(errorCode, message) {
        super(message);
        this.errorCode = errorCode;
        this.name = "McpHelperError";
    }
}

const DEFAULT_DEPENDENCIES = {
    authorize: auth,
    createClient: createMCPClient,
    createStdioTransport: (config) => new StdioClientTransport(config),
    environment: process.env,
};
/**
 * 判断服务配置是否为 stdio MCP 服务。
 *
 * @param config helper 服务配置。
 * @returns 配置包含 command 字段时返回 `true`。
 */
function isStdioConfig(config) {
    return 'command' in config;
}
/**
 * 生成适合 URL 参数使用的随机 token。
 *
 * @returns base64url 形式的随机 token。
 */
function randomUrlToken() {
    return node_crypto.randomBytes(32)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}
/**
 * 解析 stdio 服务工作目录。
 *
 * @param cwd 用户配置的工作目录。
 * @param projectRoot 当前 Cocos 项目根目录。
 * @returns 绝对工作目录路径。
 */
function resolveWorkingDirectory(cwd, projectRoot) {
    if (!cwd)
        return projectRoot;
    return path__namespace.isAbsolute(cwd) ? cwd : path__namespace.resolve(projectRoot, cwd);
}
/**
 * 构造 stdio 子进程环境变量，继承 helper 环境并应用服务级覆盖。
 *
 * @param environment helper 进程环境变量。
 * @param overrides 服务配置中的 env 覆盖。
 * @returns 可传给 stdio transport 的字符串环境变量映射。
 */
function inheritedEnvironment(environment, overrides) {
    const inherited = Object.fromEntries(Object.entries(environment).filter((entry) => typeof entry[1] === 'string'));
    return { ...inherited, ...overrides };
}
/**
 * 将操作系统级 stdio 启动失败转换为稳定且可行动的 helper 错误。
 *
 * @param error stdio transport 或 SDK 抛出的启动错误。
 * @param command 用户配置的可执行程序。
 * @param secrets 需要从错误消息中屏蔽的敏感值集合。
 * @returns 可识别启动错误时返回 helper 错误；否则返回 `null`。
 */
function stdioStartupError(error, command, secrets) {
    if (!error || typeof error !== 'object')
        return null;
    const code = error.code;
    if (code === 'ENOENT') {
        return new McpHelperError('MCP_EXECUTABLE_NOT_FOUND', `找不到 MCP 可执行程序 "${redactText(command, secrets)}"。请安装该程序并确保 Creator 启动环境的 PATH 可访问，或在 command 中使用绝对路径。`);
    }
    if (code === 'EACCES' || code === 'EPERM') {
        return new McpHelperError('MCP_EXECUTABLE_NOT_EXECUTABLE', `MCP 可执行程序 "${redactText(command, secrets)}" 没有执行权限。请检查文件权限，或改用可执行文件的绝对路径。`);
    }
    return null;
}
/** 连接前复用配置层 URL 语法校验，解析和连接由 transport 负责。 */
function validateDirectTarget(config) {
    if (!parseMcpDirectUrl(config.url)) {
        throw new McpHelperError('MCP_CONNECTION_FAILED', 'Direct MCP URL 无效，连接未启动。');
    }
}
/**
 * 读取父进程 OAuth 委托返回值中的对象 payload。
 *
 * @param value OAuth 委托返回的未知值。
 * @returns 对象 payload；非对象时返回 `undefined`。
 */
function readOAuthValue(value) {
    return value && typeof value === 'object' ? value : undefined;
}
/**
 * 将父进程返回的 OAuth 错误码收敛到 helper 稳定错误码集合。
 *
 * @param value 父进程返回的错误码。
 * @returns 可穿过 helper RPC 边界的 OAuth 错误码。
 */
function normalizeOAuthErrorCode(value) {
    switch (value) {
        case 'MCP_OAUTH_UNSUPPORTED':
        case 'MCP_OAUTH_INVALID_URL':
        case 'MCP_OAUTH_UNTRUSTED_ORIGIN':
        case 'MCP_OAUTH_REGISTRATION_FAILED':
        case 'MCP_OAUTH_REGISTRATION_UNAVAILABLE':
        case 'MCP_OAUTH_SESSION_ACTIVE':
        case 'MCP_OAUTH_NO_ACTIVE_SESSION':
        case 'MCP_OAUTH_CALLBACK_REJECTED':
        case 'MCP_OAUTH_STATE_MISMATCH':
        case 'MCP_OAUTH_AUTHORIZATION_FAILED':
        case 'MCP_OAUTH_TIMEOUT':
            return value;
        default:
            return 'MCP_OAUTH_AUTHORIZATION_FAILED';
    }
}
/**
 * 创建 AI SDK MCP OAuth provider，把凭证读写和用户授权动作委托给父进程。
 *
 * @param args OAuth provider 所需的服务、回调地址和父进程委托。
 * @returns 可传给 AI SDK MCP transport 的 OAuth provider。
 */
function createOAuthProvider(args) {
    const clientMetadata = {
        client_name: `Game Agent MCP (${args.serverId})`,
        redirect_uris: [args.redirectUrl],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
    };
    /**
     * 调用父进程 OAuth 委托并把失败响应转换为 helper 错误。
     *
     * @param payload OAuth 委托请求。
     * @returns 委托返回的对象 payload。
     */
    const request = async (payload) => {
        const response = await args.requestOAuth(payload);
        if (!response.ok) {
            throw new McpHelperError(normalizeOAuthErrorCode(response.errorCode), `MCP OAuth ${payload.operation} 委托失败。`);
        }
        return readOAuthValue(response.value);
    };
    /** 在注册或写入交互事务前拒绝后台授权，保留正在等待浏览器回调的 state/PKCE。 */
    const requireInteractiveAuthorization = () => {
        if (!args.allowAuthorizationRedirect) {
            throw new McpHelperError('MCP_OAUTH_UNSUPPORTED', 'Direct MCP OAuth 需要用户授权。');
        }
    };
    return {
        get redirectUrl() {
            return args.redirectUrl;
        },
        get clientMetadata() {
            return clientMetadata;
        },
        tokens: () => request({
            operation: 'tokens',
            serverId: args.serverId,
        }),
        saveTokens: (tokens) => request({
            operation: 'saveTokens',
            serverId: args.serverId,
            tokens,
        }),
        clientInformation: async () => {
            const client = await request({
                operation: 'clientInformation',
                serverId: args.serverId,
            });
            if (!client)
                requireInteractiveAuthorization();
            return client;
        },
        saveClientInformation: (clientInformation) => request({
            operation: 'saveClientInformation',
            serverId: args.serverId,
            clientInformation,
        }),
        authorizationServerInformation: () => request({
            operation: 'authorizationServerInformation',
            serverId: args.serverId,
        }),
        saveAuthorizationServerInformation: (authorizationServerInformation) => request({
            operation: 'saveAuthorizationServerInformation',
            serverId: args.serverId,
            authorizationServerInformation,
        }),
        saveCodeVerifier: (codeVerifier) => {
            requireInteractiveAuthorization();
            return request({
                operation: 'saveCodeVerifier',
                serverId: args.serverId,
                codeVerifier,
            });
        },
        codeVerifier: async () => {
            const value = await request({
                operation: 'codeVerifier',
                serverId: args.serverId,
            });
            if (typeof value?.codeVerifier !== 'string' || value.codeVerifier.length === 0) {
                throw new McpHelperError('MCP_OAUTH_AUTHORIZATION_FAILED', 'OAuth code verifier 不可用。');
            }
            return value.codeVerifier;
        },
        state: () => {
            requireInteractiveAuthorization();
            return randomUrlToken();
        },
        saveState: (state) => {
            requireInteractiveAuthorization();
            return request({
                operation: 'saveState',
                serverId: args.serverId,
                state,
            });
        },
        storedState: async () => {
            const value = await request({
                operation: 'storedState',
                serverId: args.serverId,
            });
            return typeof value?.state === 'string' ? value.state : undefined;
        },
        redirectToAuthorization: (authorizationUrl) => {
            requireInteractiveAuthorization();
            return request({
                operation: 'redirectToAuthorization',
                serverId: args.serverId,
                authorizationUrl: authorizationUrl.toString(),
            });
        },
        validateAuthorizationServerURL: (serverUrl, authorizationServerUrl) => request({
            operation: 'validateAuthorizationServerURL',
            serverId: args.serverId,
            serverUrl: serverUrl.toString(),
            authorizationServerUrl: authorizationServerUrl.toString(),
        }),
        validateResourceURL: async (serverUrl, resourceUrl) => {
            const value = await request({
                operation: 'validateResourceURL',
                serverId: args.serverId,
                serverUrl: serverUrl.toString(),
                resourceUrl: resourceUrl?.toString(),
            });
            if (typeof value?.resourceUrl === 'string') {
                return new URL(value.resourceUrl);
            }
            return new URL(args.serverUrl);
        },
        invalidateCredentials: (scope) => request({
            operation: 'invalidateCredentials',
            serverId: args.serverId,
            scope,
        }),
    };
}
/**
 * 生成后台 OAuth 检查使用的占位 loopback 回调地址。
 *
 * @param serverId MCP 服务 id。
 * @returns 端口为 0 的 loopback 回调地址。
 */
function backgroundOAuthRedirectUrl(serverId) {
    return `http://127.0.0.1:0/mcp/oauth/${encodeURIComponent(serverId)}/callback`;
}
/**
 * 校验用户显式授权流程传入的 loopback OAuth 回调地址。
 *
 * @param value 待校验回调地址。
 * @returns 标准化后的回调地址字符串。
 * @throws McpHelperError 回调地址不是带实际端口的 loopback HTTP URL 时抛出。
 */
function assertLoopbackRedirectUrl(value) {
    let redirectUrl;
    try {
        redirectUrl = new URL(value);
    }
    catch {
        throw new McpHelperError('MCP_INVALID_PARAMS', 'OAuth redirectUrl 无效。');
    }
    const isLoopback = redirectUrl.hostname === '127.0.0.1' || redirectUrl.hostname === '[::1]';
    if (redirectUrl.protocol !== 'http:' ||
        !isLoopback ||
        !redirectUrl.port ||
        redirectUrl.port === '0' ||
        redirectUrl.username ||
        redirectUrl.password ||
        redirectUrl.hash) {
        throw new McpHelperError('MCP_INVALID_PARAMS', 'OAuth redirectUrl 必须是带实际端口的 loopback HTTP URL。');
    }
    return redirectUrl.toString();
}
/**
 * 创建外部 helper 进程使用的真实 MCP client factory。
 *
 * @param dependencies SDK、stdio transport、环境变量和 DNS 查询依赖。
 * @returns helper session 可注入的 MCP client factory。
 */
function createSdkMcpClientFactory(dependencies = DEFAULT_DEPENDENCIES) {
    /**
     * 根据服务配置创建单个 MCP client，并注册 stdio 诊断和 elicitation 转发。
     *
     * @param config MCP 服务配置。
     * @param context helper session 提供的服务上下文。
     * @returns 可由 helper session 管理的 MCP client。
     */
    const factory = async (config, context) => {
        const oauthRequester = !isStdioConfig(config) && config.auth?.type === 'oauth'
            ? context.requestOAuth
            : undefined;
        if (!isStdioConfig(config)) {
            validateDirectTarget(config);
            if (config.auth?.type === 'oauth' && !oauthRequester) {
                throw new McpHelperError('MCP_OAUTH_UNSUPPORTED', 'Direct MCP OAuth 尚未配置主进程授权委托，连接未启动。');
            }
        }
        const transport = isStdioConfig(config)
            ? dependencies.createStdioTransport({
                command: config.command,
                args: config.args,
                env: inheritedEnvironment(dependencies.environment, config.env),
                cwd: resolveWorkingDirectory(config.cwd, context.projectRoot),
                stderr: 'pipe',
            })
            : {
                type: config.type,
                url: config.url,
                headers: config.headers,
                authProvider: oauthRequester
                    ? createOAuthProvider({
                        serverId: context.serverId,
                        serverUrl: config.url,
                        redirectUrl: backgroundOAuthRedirectUrl(context.serverId),
                        allowAuthorizationRedirect: false,
                        requestOAuth: oauthRequester,
                    })
                    : undefined,
                redirect: 'error',
            };
        let diagnostics;
        if (isStdioConfig(config)) {
            const stderr = transport.stderr;
            if (stderr) {
                diagnostics = createStderrDiagnostics(stderr, collectConfigSecrets(config));
            }
        }
        let client;
        try {
            client = await dependencies.createClient({
                transport,
                clientName: 'game-agent-mcp-helper',
                version: '1.0.0',
                capabilities: {
                    elicitation: {},
                },
            });
        }
        catch (error) {
            const stderrSummary = diagnostics?.snapshot() ?? [];
            diagnostics?.dispose();
            if (isStdioConfig(config)) {
                await transport.close().catch(() => undefined);
                const startupError = stdioStartupError(error, config.command, collectConfigSecrets(config));
                if (startupError) {
                    throw startupError;
                }
            }
            if (stderrSummary.length > 0) {
                throw new McpHelperError('MCP_CONNECTION_FAILED', `MCP stdio 服务启动失败。stderr: ${stderrSummary.join(' | ')}`);
            }
            throw error;
        }
        client.onElicitationRequest(ElicitationRequestSchema, async (request) => {
            if (!context.requestElicitation) {
                throw new McpHelperError('MCP_ELICITATION_UNSUPPORTED', 'MCP elicitation 尚未配置主进程交互桥接。');
            }
            return context.requestElicitation({
                message: request.params.message,
                requestedSchema: request.params.requestedSchema,
            });
        });
        const helperClient = client;
        if (diagnostics) {
            registerClientDiagnostics(helperClient, diagnostics);
        }
        return helperClient;
    };
    /**
     * 启动用户显式触发的 OAuth 授权流程。
     *
     * @param context OAuth start 上下文。
     * @returns AI SDK authorize 的结果。
     */
    factory.startOAuth = async (context) => {
        const redirectUrl = assertLoopbackRedirectUrl(context.redirectUrl);
        const provider = createOAuthProvider({
            serverId: context.serverId,
            serverUrl: context.serverUrl,
            redirectUrl,
            allowAuthorizationRedirect: true,
            requestOAuth: context.requestOAuth,
        });
        await provider.invalidateCredentials?.('all');
        return dependencies.authorize(provider, { serverUrl: context.serverUrl });
    };
    /**
     * 使用授权回调中的 code/state 完成 OAuth 交换。
     *
     * @param context OAuth finish 上下文。
     * @returns AI SDK authorize 的结果。
     */
    factory.finishOAuth = async (context) => {
        const redirectUrl = assertLoopbackRedirectUrl(context.redirectUrl);
        const provider = createOAuthProvider({
            serverId: context.serverId,
            serverUrl: context.serverUrl,
            redirectUrl,
            allowAuthorizationRedirect: false,
            requestOAuth: context.requestOAuth,
        });
        return dependencies.authorize(provider, {
            serverUrl: context.serverUrl,
            authorizationCode: context.code,
            callbackState: context.state,
        });
    };
    return factory;
}

/**
 * 判断未知消息是否为 helper 私有 JSON-RPC 请求。
 *
 * @param value 父进程发来的未知消息。
 * @returns 消息满足 JSON-RPC 请求最小结构时返回 `true`。
 */
function isHelperRpcRequest(value) {
    return !!value
        && typeof value === "object"
        && value.jsonrpc === "2.0"
        && typeof value.id === "number"
        && typeof value.method === "string";
}
/**
 * 构造 helper JSON-RPC 失败响应。
 *
 * @param id 请求 id。
 * @param code JSON-RPC 错误码。
 * @param errorCode helper 稳定错误码。
 * @param message 已脱敏错误消息。
 * @returns JSON-RPC 失败响应。
 */
function failure(id, code, errorCode, message) {
    return {
        jsonrpc: "2.0",
        id,
        error: {
            code,
            message,
            data: { errorCode },
        },
    };
}
/**
 * 创建 helper 私有 JSON-RPC 请求处理器。
 *
 * @param session helper MCP 会话管理器。
 * @returns 可处理单条 helper RPC 请求的异步函数。
 */
function createMcpHelperRpcHandler(session) {
    return async (request) => {
        try {
            let result;
            switch (request.method) {
                case "health":
                    result = {
                        ok: true,
                        nodeVersion: process.versions.node,
                        pid: process.pid,
                    };
                    break;
                case "configure":
                    result = await session.configure(request.params);
                    break;
                case "status":
                case "listCapabilities":
                    result = session.status(request.params);
                    break;
                case "refresh":
                    result = await session.refresh(request.params);
                    break;
                case "oauth/start":
                    result = await session.oauthStart(request.params);
                    break;
                case "oauth/finish":
                    result = await session.oauthFinish(request.params);
                    break;
                case "callTool":
                    result = await session.callTool(request.params);
                    break;
                case "listResources":
                    result = await session.listResources(request.params);
                    break;
                case "listResourceTemplates":
                    result = await session.listResourceTemplates(request.params);
                    break;
                case "readResource":
                    result = await session.readResource(request.params);
                    break;
                case "listPrompts":
                    result = await session.listPrompts(request.params);
                    break;
                case "getPrompt":
                    result = await session.getPrompt(request.params);
                    break;
                case "cancel":
                    result = session.cancel(request.params);
                    break;
                case "close":
                    result = await session.close(request.params);
                    break;
                case "shutdown":
                    result = await session.shutdown();
                    break;
                default:
                    return failure(request.id, -32601, "MCP_METHOD_NOT_FOUND", "未知 MCP helper method。");
            }
            return { jsonrpc: "2.0", id: request.id, result };
        }
        catch (error) {
            if (error instanceof McpHelperError) {
                return failure(request.id, -32010, error.errorCode, error.message);
            }
            return failure(request.id, -32603, "MCP_INTERNAL_ERROR", "MCP helper 内部错误。");
        }
    };
}

const JSON_RPC_METHOD_NOT_FOUND = -32601;
/**
 * 判断未知值是否为可读取字段的普通对象。
 *
 * @param value 待判断的未知值。
 * @returns 值为非数组对象时返回 `true`。
 */
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
/**
 * 从错误对象或其 cause 中读取 JSON-RPC 数字错误码。
 *
 * @param error 外部 SDK 或 helper 内部抛出的错误。
 * @returns 可识别的数字错误码；不存在时返回 `undefined`。
 */
function readErrorCode(error) {
    if (!isRecord(error))
        return undefined;
    if (typeof error.code === "number")
        return error.code;
    if (isRecord(error.cause) && typeof error.cause.code === "number") {
        return error.cause.code;
    }
    return undefined;
}
/**
 * 读取错误消息文本，避免把非标准错误对象直接序列化。
 *
 * @param error 外部 SDK 或 helper 内部抛出的错误。
 * @returns 可用于脱敏和摘要化的错误消息。
 */
function readErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (isRecord(error) && typeof error.message === "string")
        return error.message;
    return "";
}
/**
 * 从错误对象或 cause 中读取稳定的字符串错误码。
 *
 * @param error 外部 SDK 或 helper 内部抛出的错误。
 * @returns 字符串化后的错误码；不存在时返回 `undefined`。
 */
function readErrorCodeText(error) {
    if (!isRecord(error))
        return undefined;
    if (typeof error.code === "string" && error.code.length > 0)
        return error.code;
    if (typeof error.code === "number")
        return String(error.code);
    if (isRecord(error.cause)) {
        if (typeof error.cause.code === "string" && error.cause.code.length > 0)
            return error.cause.code;
        if (typeof error.cause.code === "number")
            return String(error.cause.code);
    }
    return undefined;
}
/**
 * 判断资源模板发现失败是否属于服务不支持该可选 MCP 方法。
 *
 * @param error 资源模板列表调用抛出的错误。
 * @returns 可安全降级为空列表时返回 `true`。
 */
function isUnsupportedOptionalResourceTemplateError(error) {
    if (readErrorCode(error) === JSON_RPC_METHOD_NOT_FOUND)
        return true;
    const message = readErrorMessage(error);
    return /method not found|unsupported method|does not support resources\/templates\/list|does not support resource templates/i
        .test(message);
}
/**
 * 判断未知配置是否满足 helper 可连接的 MCP 服务配置最小形态。
 *
 * @param value 待验证的配置值。
 * @returns 配置为 stdio、HTTP 或 SSE 服务时返回 `true`。
 */
function isServerConfig(value) {
    if (!isRecord(value))
        return false;
    if (typeof value.command === "string")
        return true;
    return (value.type === "http" || value.type === "sse") && typeof value.url === "string";
}
/**
 * 读取服务权限，并把缺省或未知权限收敛为 `auto`。
 *
 * @param config MCP 服务配置。
 * @returns helper 内部使用的服务权限。
 */
function permissionOf(config) {
    return config.permission === "disabled" || config.permission === "manual" || config.permission === "auto"
        ? config.permission
        : "auto";
}
/**
 * 推导服务使用的 MCP transport 类型。
 *
 * @param config MCP 服务配置。
 * @returns stdio、HTTP 或 SSE transport 标识。
 */
function transportOf(config) {
    return "command" in config ? "stdio" : config.type;
}
/**
 * 为影响连接生命周期的配置字段生成稳定指纹。
 *
 * @param config MCP 服务配置。
 * @param projectRoot 当前项目根目录。
 * @returns 不包含权限字段的连接指纹。
 */
function connectionFingerprint(config, projectRoot) {
    const { permission: _permission, ...connection } = config;
    return JSON.stringify({ projectRoot, connection });
}
/**
 * 创建空能力快照，供未连接、禁用或错误状态复用。
 *
 * @returns 不包含任何工具、资源、资源模板、提示词和诊断的能力快照。
 */
function emptyCapabilities() {
    return {
        tools: [],
        resources: [],
        resourceTemplates: [],
        prompts: [],
        diagnostics: [],
    };
}
/**
 * 读取必填字符串字段，并统一转换为 helper 参数错误。
 *
 * @param value 待验证字段值。
 * @param field 字段名，用于错误消息。
 * @returns 非空字符串字段值。
 * @throws McpHelperError 字段缺失或为空时抛出。
 */
function requireString(value, field) {
    if (typeof value !== "string" || value.length === 0) {
        throw new McpHelperError("MCP_INVALID_PARAMS", `缺少有效的 ${field}。`);
    }
    return value;
}
/**
 * 归一化 helper `configure` 入参，兼容单服务更新和完整服务映射替换。
 *
 * @param params 父进程通过 helper RPC 传入的 configure 参数。
 * @returns 项目根目录、服务配置映射和是否全量替换的判定结果。
 * @throws McpHelperError 参数结构或服务配置无效时抛出。
 */
function normalizeConfigureParams(params) {
    if (!isRecord(params)) {
        throw new McpHelperError("MCP_INVALID_PARAMS", "configure params 必须是对象。");
    }
    const typed = params;
    const projectRoot = typeof typed.projectRoot === "string" && typed.projectRoot.length > 0
        ? typed.projectRoot
        : process.cwd();
    if (typed.serverId !== undefined || typed.config !== undefined) {
        const serverId = requireString(typed.serverId, "serverId");
        if (!isServerConfig(typed.config)) {
            throw new McpHelperError("MCP_INVALID_PARAMS", "缺少有效的 config。");
        }
        return { projectRoot, servers: { [serverId]: typed.config }, replaceAll: false };
    }
    const rawServers = typed.mcpServers ?? typed.servers;
    if (!isRecord(rawServers)) {
        throw new McpHelperError("MCP_INVALID_PARAMS", "缺少 mcpServers。");
    }
    const servers = {};
    for (const [serverId, config] of Object.entries(rawServers)) {
        if (!isServerConfig(config)) {
            throw new McpHelperError("MCP_INVALID_PARAMS", `服务 ${serverId} 配置无效。`);
        }
        servers[serverId] = config;
    }
    return { projectRoot, servers, replaceAll: true };
}
/**
 * 读取通用服务定位参数。
 *
 * @param params helper RPC 入参。
 * @returns 归一化后的服务定位参数。
 */
function readServiceParams(params) {
    if (!isRecord(params)) {
        throw new McpHelperError("MCP_INVALID_PARAMS", "params 必须是对象。");
    }
    return {
        serverId: requireString(params.serverId, "serverId"),
        generation: typeof params.generation === "number" ? params.generation : undefined,
        requestId: typeof params.requestId === "string"
            ? requireString(params.requestId, "requestId")
            : undefined,
    };
}
/**
 * 读取取消请求参数。
 *
 * @param params helper RPC 入参。
 * @returns 归一化后的取消参数。
 */
function readCancelParams(params) {
    if (!isRecord(params)) {
        throw new McpHelperError("MCP_INVALID_PARAMS", "cancel params 必须是对象。");
    }
    return {
        requestId: requireString(params.requestId, "requestId"),
    };
}
/**
 * 读取 MCP 工具调用参数。
 *
 * @param params helper RPC 入参。
 * @returns 归一化后的工具调用参数。
 */
function readCallToolParams(params) {
    const base = readServiceParams(params);
    const record = params;
    return {
        ...base,
        toolName: requireString(record.toolName, "toolName"),
        input: record.input,
    };
}
/**
 * 读取 MCP resource 读取参数。
 *
 * @param params helper RPC 入参。
 * @returns 归一化后的 resource 读取参数。
 */
function readResourceParams(params) {
    const base = readServiceParams(params);
    return {
        ...base,
        uri: requireString(params.uri, "uri"),
    };
}
/**
 * 读取 MCP prompt 获取参数，并只接受对象形式的 prompt arguments。
 *
 * @param params helper RPC 入参。
 * @returns 归一化后的 prompt 获取参数。
 */
function readGetPromptParams(params) {
    const base = readServiceParams(params);
    const record = params;
    const args = isRecord(record.arguments) ? record.arguments : undefined;
    return {
        ...base,
        promptName: typeof record.promptName === "string" ? record.promptName : undefined,
        name: typeof record.name === "string" ? record.name : undefined,
        arguments: args,
    };
}

const MAX_PAGES = 20;
const MAX_CAPABILITY_ITEMS = 500;
/**
 * 脱敏单个 MCP 工具能力，同时保留可序列化的输入 Schema。
 *
 * @param item MCP client 返回的原始工具能力。
 * @param secrets 当前服务配置中需要屏蔽的敏感值集合。
 * @returns 可穿过 helper RPC 边界的工具能力快照。
 */
function sanitizeToolCapability(item, secrets) {
    const metadata = { ...item };
    delete metadata.inputSchema;
    return {
        ...sanitizeSerializable(metadata, secrets),
        inputSchema: sanitizeJsonSchemaSerializable(item.inputSchema, secrets),
    };
}
/**
 * 从 MCP client 发现工具、资源、资源模板和提示词能力。
 *
 * @param client 当前 generation 的 MCP client。
 * @param signal 可选取消信号。
 * @param secrets 需要从能力快照中脱敏的敏感值集合。
 * @returns 脱敏能力快照和保留给工具执行适配层的原始工具定义。
 */
async function discoverMcpCapabilities(client, signal, secrets = []) {
    const declared = client.serverCapabilities;
    const supportsTools = declared ? !!declared.tools : true;
    const supportsResources = declared ? !!declared.resources : true;
    const supportsPrompts = declared ? !!declared.prompts : true;
    const tools = supportsTools
        ? await discoverPages("工具", (cursor) => client.listTools(buildListRequest(cursor, signal)), "tools")
        : { items: [] };
    const resources = supportsResources
        ? await discoverPages("资源", (cursor) => client.listResources(buildListRequest(cursor, signal)), "resources")
        : { items: [] };
    const resourceTemplates = supportsResources
        ? await discoverOptionalResourceTemplates("资源模板", (cursor) => client.listResourceTemplates(buildListRequest(cursor, signal)), "resourceTemplates")
        : { items: [] };
    const prompts = supportsPrompts
        ? await discoverPages("提示词", (cursor) => client.experimental_listPrompts(buildListRequest(cursor, signal)), "prompts")
        : { items: [] };
    return {
        capabilities: {
            tools: tools.items.map((item) => sanitizeToolCapability(item, secrets)),
            resources: sanitizeSerializable(resources.items, secrets),
            resourceTemplates: sanitizeSerializable(resourceTemplates.items, secrets),
            prompts: sanitizeSerializable(prompts.items, secrets),
            diagnostics: [],
        },
        toolDefinitions: tools.items,
    };
}
/**
 * 构造 MCP list 请求参数，按需携带 cursor 与 AbortSignal。
 *
 * @param cursor MCP 分页游标。
 * @param signal 可选取消信号。
 * @returns 可直接传给 SDK list 方法的参数对象。
 */
function buildListRequest(cursor, signal) {
    return {
        ...(cursor ? { params: { cursor } } : {}),
        ...(signal ? { options: { signal } } : {}),
    };
}
/**
 * 执行必需能力分页发现，并把失败归一化为连接失败。
 *
 * @param label 能力中文名称，用于错误消息。
 * @param load 分页加载函数。
 * @param key 响应中承载条目的字段名。
 * @returns 收集后的能力条目和未消费 cursor。
 */
async function discoverPages(label, load, key) {
    try {
        return await collectPages(load, key);
    }
    catch {
        throw new McpHelperError("MCP_CONNECTION_FAILED", `MCP ${label}能力发现失败。`);
    }
}
/**
 * 执行可选资源模板能力发现，服务不支持时降级为空列表。
 *
 * @param label 能力中文名称，用于错误消息。
 * @param load 分页加载函数。
 * @param key 响应中承载条目的字段名。
 * @returns 收集后的资源模板条目和未消费 cursor。
 */
async function discoverOptionalResourceTemplates(label, load, key) {
    try {
        return await collectPages(load, key);
    }
    catch (error) {
        if (isUnsupportedOptionalResourceTemplateError(error)) {
            return { items: [] };
        }
        throw new McpHelperError("MCP_CONNECTION_FAILED", `MCP ${label}能力发现失败。`);
    }
}
/**
 * 按 cursor 收集 MCP 分页结果，并限制页数与总条目数。
 *
 * @param load 分页加载函数。
 * @param key 响应中承载条目的字段名。
 * @returns 收集后的条目和最后一个未消费 cursor。
 */
async function collectPages(load, key) {
    const items = [];
    let cursor;
    for (let page = 0; page < MAX_PAGES && items.length < MAX_CAPABILITY_ITEMS; page += 1) {
        const result = await load(cursor);
        const pageItems = Array.isArray(result[key]) ? result[key] : [];
        items.push(...pageItems.slice(0, MAX_CAPABILITY_ITEMS - items.length));
        cursor = typeof result.nextCursor === "string" ? result.nextCursor : undefined;
        if (!cursor)
            break;
    }
    return { items, nextCursor: cursor };
}

/**
 * 管理 helper session 内可取消请求、活动工具调用和 MCP elicitation 来源绑定。
 */
class McpSessionRequestRegistry {
    activeRequests = new Map();
    activeToolCalls = new Map();
    nextElicitationId = 1;
    /**
     * 在可取消请求作用域内执行异步操作，并按 requestId 支持后续 cancel。
     *
     * @param requestId 可选请求 id；存在时用于后续取消。
     * @param serverId 可选服务 id，用于关闭服务时批量取消。
     * @param operation 接收取消信号的异步操作。
     * @returns 操作返回值。
     */
    async runCancelable(requestId, serverId, operation) {
        const controller = new AbortController();
        if (requestId) {
            if (this.activeRequests.has(requestId)) {
                throw new McpHelperError("MCP_INVALID_PARAMS", `MCP requestId ${requestId} 正在使用。`);
            }
            this.activeRequests.set(requestId, { controller, serverId });
        }
        try {
            return await operation(controller.signal);
        }
        catch (error) {
            if (controller.signal.aborted && !(error instanceof McpHelperError)) {
                throw new McpHelperError("MCP_REQUEST_CANCELLED", "MCP 请求已取消。");
            }
            throw error;
        }
        finally {
            if (requestId && this.activeRequests.get(requestId)?.controller === controller) {
                this.activeRequests.delete(requestId);
            }
        }
    }
    /**
     * 取消一个活动请求；未知或已完成的 requestId 会稳定返回未取消。
     *
     * @param requestId 活动请求 id。
     * @returns requestId 与是否实际触发取消。
     */
    cancel(requestId) {
        const active = this.activeRequests.get(requestId);
        if (!active || active.controller.signal.aborted) {
            return { requestId, cancelled: false };
        }
        active.controller.abort();
        return { requestId, cancelled: true };
    }
    /**
     * 取消全部活动请求，或只取消指定服务的活动请求。
     *
     * @param serverId 可选服务 id；缺失时取消全部请求。
     */
    abortRequests(serverId) {
        for (const active of this.activeRequests.values()) {
            if (serverId === undefined || active.serverId === serverId) {
                active.controller.abort();
            }
        }
    }
    /**
     * 在活动工具调用作用域内执行操作，使 MCP elicitation 能绑定到来源工具。
     *
     * @param call 活动工具调用上下文。
     * @param operation 需要在该上下文内执行的异步操作。
     * @returns 操作返回值。
     */
    async runToolCall(call, operation) {
        const activeToolCall = {
            requestId: call.requestId ?? this.createToolRequestId(call),
            serverId: call.serverId,
            generation: call.generation,
            toolName: call.toolName,
        };
        this.activeToolCalls.set(activeToolCall.requestId, activeToolCall);
        try {
            return await operation();
        }
        finally {
            if (this.activeToolCalls.get(activeToolCall.requestId) === activeToolCall) {
                this.activeToolCalls.delete(activeToolCall.requestId);
            }
        }
    }
    /**
     * 将 MCP elicitation 请求绑定到唯一活动工具调用并委托父进程处理。
     *
     * @param serverId 发起 elicitation 的服务 id。
     * @param request MCP client 传入的 elicitation 请求。
     * @param requester 父进程 elicitation 交互桥。
     * @returns 父进程用户交互桥接返回的 elicitation 响应。
     * @throws McpHelperError 没有委托或并发工具调用导致来源不唯一时抛出。
     */
    async requestElicitation(serverId, request, requester) {
        const activeCalls = [...this.activeToolCalls.values()]
            .filter((item) => item.serverId === serverId);
        if (!requester || activeCalls.length !== 1) {
            throw new McpHelperError("MCP_ELICITATION_UNSUPPORTED", activeCalls.length > 1
                ? "MCP elicitation 无法在并发工具调用中确定来源。"
                : "MCP elicitation 尚未配置主进程交互桥接。");
        }
        const active = activeCalls[0];
        return requester({
            serverId: active.serverId,
            generation: active.generation,
            requestId: active.requestId,
            elicitationId: `${active.requestId}:elicitation:${this.nextElicitationId++}`,
            toolName: active.toolName,
            message: request.message,
            requestedSchema: request.requestedSchema,
        });
    }
    /**
     * 为缺失 requestId 的工具调用生成内部 elicitation 关联 id。
     *
     * @param call 活动工具调用上下文。
     * @returns 内部工具调用请求 id。
     */
    createToolRequestId(call) {
        return `tool-${call.serverId}-${call.generation}-${Date.now()}`;
    }
}

const DRAIN_TIMEOUT_MS = 30_000;
/**
 * 管理 MCP helper 内的服务会话、generation 一致性、能力发现和可取消请求。
 */
class McpSessionManager {
    createClient;
    options;
    records = new Map();
    desiredGenerations = new Map();
    requestRegistry = new McpSessionRequestRegistry();
    nextGeneration = 1;
    isClosed = false;
    /**
     * 创建 MCP 会话管理器。
     *
     * @param createClient helper 内部 MCP client 工厂。
     * @param options 父进程提供的 OAuth 与 elicitation 交互委托。
     */
    constructor(createClient, options = {}) {
        this.createClient = createClient;
        this.options = options;
    }
    /**
     * 应用单个服务配置或完整服务映射，新 generation 发现成功后才替换旧 client。
     *
     * @param params helper RPC 的 configure 入参。
     * @returns 当前所有已知服务的脱敏状态快照。
     */
    async configure(params) {
        this.assertOpen();
        const normalized = normalizeConfigureParams(params);
        if (normalized.replaceAll) {
            const removedIds = [...this.records.keys()].filter((serverId) => !(serverId in normalized.servers));
            await Promise.all(removedIds.map((serverId) => this.close({ serverId })));
        }
        await Promise.all(Object.entries(normalized.servers).map(([serverId, config]) => this.configureServer(serverId, config, normalized.projectRoot)));
        return { servers: this.status().servers };
    }
    /**
     * 返回可序列化且不包含敏感配置的服务状态快照。
     *
     * @param params 可选服务筛选参数。
     * @returns 指定服务或全部服务的状态快照。
     */
    status(params) {
        const serverId = isRecord(params) && typeof params.serverId === "string" ? params.serverId : undefined;
        const records = serverId
            ? [this.records.get(serverId)].filter((record) => !!record)
            : [...this.records.values()];
        return {
            servers: records
                .sort((left, right) => left.serverId.localeCompare(right.serverId))
                .map((record) => this.toStatus(record)),
        };
    }
    /**
     * 为当前 generation 重新发现工具、资源、资源模板和提示词能力。
     *
     * @param params 可选服务筛选和 requestId 参数。
     * @returns 刷新后的服务状态快照。
     */
    async refresh(params) {
        this.assertOpen();
        const typed = isRecord(params) && typeof params.serverId === "string"
            ? readServiceParams(params)
            : undefined;
        const targets = typed ? [this.requireRefreshable(typed)] : [...this.records.values()];
        return this.requestRegistry.runCancelable(typed?.requestId, typed?.serverId, async (signal) => {
            await Promise.all(targets.map(async (record) => {
                if (!record.client || record.status !== "connected")
                    return;
                const generation = record.generation;
                const refreshed = await discoverMcpCapabilities(record.client, signal, collectConfigSecrets(record.config));
                this.assertCurrent(record.serverId, generation, record);
                record.capabilities = refreshed.capabilities;
                record.toolDefinitions = refreshed.toolDefinitions;
                record.lastSuccessfulAt = new Date().toISOString();
            }));
            return { servers: this.status(params).servers };
        });
    }
    /**
     * 启动用户显式触发的 OAuth 授权流程，不自动改变当前连接。
     *
     * @param params OAuth start 参数，包含服务 id 和回调地址。
     * @returns 目标服务的最新状态快照。
     */
    async oauthStart(params) {
        this.assertOpen();
        const typed = this.readOAuthStartParams(params);
        const record = this.requireOAuthRecord(typed.serverId);
        const requestOAuth = this.requireOAuthRequester();
        if (!this.createClient.startOAuth) {
            throw new McpHelperError("MCP_OAUTH_UNSUPPORTED", "MCP helper OAuth start 未配置。");
        }
        try {
            await this.createClient.startOAuth({
                serverId: record.serverId,
                serverUrl: record.config.url,
                redirectUrl: typed.redirectUrl,
                requestOAuth,
            });
        }
        catch (error) {
            if (error instanceof McpHelperError)
                throw error;
            throw new McpHelperError("MCP_OAUTH_AUTHORIZATION_FAILED", "MCP OAuth 授权启动失败。");
        }
        return { servers: this.status({ serverId: typed.serverId }).servers };
    }
    /**
     * 完成 OAuth 授权码交换，并在授权成功后重建服务连接和能力快照。
     *
     * @param params OAuth finish 参数，包含服务 id、回调地址、授权码和 state。
     * @returns 目标服务的最新状态快照。
     */
    async oauthFinish(params) {
        this.assertOpen();
        const typed = this.readOAuthFinishParams(params);
        const record = this.requireOAuthRecord(typed.serverId);
        const requestOAuth = this.requireOAuthRequester();
        if (!this.createClient.finishOAuth) {
            throw new McpHelperError("MCP_OAUTH_UNSUPPORTED", "MCP helper OAuth finish 未配置。");
        }
        try {
            const result = await this.createClient.finishOAuth({
                serverId: record.serverId,
                serverUrl: record.config.url,
                redirectUrl: typed.redirectUrl,
                code: typed.code,
                state: typed.state,
                requestOAuth,
            });
            if (result !== "AUTHORIZED") {
                throw new McpHelperError("MCP_OAUTH_AUTHORIZATION_FAILED", "MCP OAuth 授权回调未完成。");
            }
            await this.configureServer(record.serverId, record.config, record.projectRoot, true);
        }
        catch (error) {
            if (error instanceof McpHelperError)
                throw error;
            throw new McpHelperError("MCP_OAUTH_AUTHORIZATION_FAILED", "MCP OAuth 授权回调处理失败。");
        }
        return { servers: this.status({ serverId: typed.serverId }).servers };
    }
    /**
     * 调用指定 generation 中已发现的 MCP 工具。
     *
     * @param params 工具调用参数，包含服务 id、工具名、输入和可选 requestId。
     * @returns MCP 工具执行结果；返回前会按服务配置敏感值脱敏。
     */
    async callTool(params) {
        const typed = readCallToolParams(params);
        return this.withCurrentRecord(typed, async (record, signal) => {
            const client = record.client;
            const tools = client.toolsFromDefinitions
                ? client.toolsFromDefinitions({ tools: record.toolDefinitions })
                : await client.tools?.();
            const tool = tools?.[typed.toolName];
            if (!tool?.execute) {
                throw new McpHelperError("MCP_TOOL_NOT_FOUND", `MCP 工具 ${typed.toolName} 不存在。`);
            }
            const executeTool = tool.execute;
            return this.requestRegistry.runToolCall({
                requestId: typed.requestId,
                serverId: record.serverId,
                generation: record.generation,
                toolName: typed.toolName,
            }, async () => executeTool(typed.input ?? {}, {
                abortSignal: signal,
                toolCallId: `mcp-${record.serverId}-${record.generation}`,
                messages: [],
            }));
        });
    }
    /**
     * 列出当前连接服务暴露的 MCP resources。
     *
     * @param params 服务定位参数。
     * @returns MCP resources/list 原始结果的脱敏投影。
     */
    async listResources(params) {
        return this.withCurrentRecord(readServiceParams(params), (record, signal) => record.client.listResources({ options: { signal } }));
    }
    /**
     * 列出当前连接服务暴露的 MCP resource templates。
     *
     * @param params 服务定位参数。
     * @returns MCP resources/templates/list 结果；服务不支持时返回空模板列表。
     */
    async listResourceTemplates(params) {
        return this.withCurrentRecord(readServiceParams(params), async (record, signal) => {
            try {
                return await record.client.listResourceTemplates({ options: { signal } });
            }
            catch (error) {
                if (isUnsupportedOptionalResourceTemplateError(error)) {
                    return { resourceTemplates: [] };
                }
                throw error;
            }
        });
    }
    /**
     * 读取当前连接服务中的指定 MCP resource URI。
     *
     * @param params 服务定位参数和待读取 URI。
     * @returns MCP resources/read 原始结果的脱敏投影。
     */
    async readResource(params) {
        const typed = readResourceParams(params);
        return this.withCurrentRecord(typed, (record, signal) => record.client.readResource({
            uri: typed.uri,
            options: { signal },
        }));
    }
    /**
     * 列出当前连接服务暴露的 MCP prompts。
     *
     * @param params 服务定位参数。
     * @returns MCP prompts/list 原始结果的脱敏投影。
     */
    async listPrompts(params) {
        return this.withCurrentRecord(readServiceParams(params), (record, signal) => record.client.experimental_listPrompts({ options: { signal } }));
    }
    /**
     * 获取当前连接服务中的指定 MCP prompt 内容。
     *
     * @param params 服务定位参数、prompt 名称和可选参数。
     * @returns MCP prompts/get 原始结果的脱敏投影。
     */
    async getPrompt(params) {
        const typed = readGetPromptParams(params);
        const name = requireString(typed.promptName ?? typed.name, "promptName");
        return this.withCurrentRecord(typed, (record, signal) => record.client.experimental_getPrompt({
            name,
            arguments: typed.arguments,
            options: { signal },
        }));
    }
    /**
     * 取消一个活动请求；未知或已完成的 requestId 会稳定返回未取消。
     *
     * @param params 取消参数，包含 requestId。
     * @returns requestId 与是否实际触发取消。
     */
    cancel(params) {
        const typed = readCancelParams(params);
        return this.requestRegistry.cancel(typed.requestId);
    }
    /**
     * 关闭单个服务或全部服务，但不终止 helper 进程本身。
     *
     * @param params 可选服务定位参数。
     * @returns 已关闭服务 id 列表。
     */
    async close(params) {
        const serverId = isRecord(params) && typeof params.serverId === "string" ? params.serverId : undefined;
        const ids = serverId ? [serverId] : [...this.records.keys()];
        const closed = [];
        await Promise.all(ids.map(async (id) => {
            this.requestRegistry.abortRequests(id);
            this.desiredGenerations.set(id, this.nextGeneration++);
            const record = this.records.get(id);
            if (!record)
                return;
            this.records.delete(id);
            await this.closeRecord(record, true);
            closed.push(id);
        }));
        return { closed };
    }
    /**
     * 关闭所有服务会话，并拒绝后续操作。
     *
     * @returns helper shutdown 成功标记。
     */
    async shutdown() {
        this.requestRegistry.abortRequests();
        await this.close();
        this.isClosed = true;
        return { ok: true };
    }
    /**
     * 按服务配置创建或替换服务 generation，并在发现成功后发布新记录。
     *
     * @param serverId MCP 服务 id。
     * @param config MCP 服务配置。
     * @param projectRoot 当前项目根目录。
     * @param forceReconnect 指纹未变化时是否仍强制重连。
     */
    async configureServer(serverId, config, projectRoot, forceReconnect = false) {
        const generation = this.nextGeneration++;
        this.desiredGenerations.set(serverId, generation);
        const existing = this.records.get(serverId);
        const fingerprint = connectionFingerprint(config, projectRoot);
        if (permissionOf(config) === "disabled") {
            if (existing) {
                this.records.delete(serverId);
                await this.closeRecord(existing, true);
            }
            this.records.set(serverId, {
                serverId,
                config,
                projectRoot,
                fingerprint,
                generation,
                status: "disabled",
                client: null,
                capabilities: emptyCapabilities(),
                toolDefinitions: [],
                activeCalls: 0,
                isDraining: false,
            });
            return;
        }
        if (!forceReconnect && existing?.client && existing.fingerprint === fingerprint) {
            existing.config = config;
            return;
        }
        let candidate = null;
        try {
            candidate = await this.createClient(config, {
                serverId,
                projectRoot,
                requestElicitation: (request) => this.requestRegistry.requestElicitation(serverId, request, this.options.requestElicitation),
                requestOAuth: this.options.requestOAuth,
            });
            const refreshed = await discoverMcpCapabilities(candidate, undefined, collectConfigSecrets(config));
            if (this.desiredGenerations.get(serverId) !== generation) {
                disposeClientDiagnostics(candidate);
                await candidate.close();
                return;
            }
            const record = {
                serverId,
                config,
                projectRoot,
                fingerprint,
                generation,
                status: "connected",
                client: candidate,
                capabilities: refreshed.capabilities,
                toolDefinitions: refreshed.toolDefinitions,
                activeCalls: 0,
                isDraining: false,
                lastSuccessfulAt: new Date().toISOString(),
            };
            this.records.set(serverId, record);
            if (existing) {
                void this.closeRecord(existing, false);
            }
        }
        catch (error) {
            if (candidate) {
                disposeClientDiagnostics(candidate);
                await candidate.close().catch(() => undefined);
            }
            if (this.desiredGenerations.get(serverId) !== generation) {
                return;
            }
            if (existing?.client) {
                existing.lastError = this.safeError(error, config);
                return;
            }
            const isOAuth = error instanceof McpHelperError && error.errorCode === "MCP_OAUTH_UNSUPPORTED";
            this.records.set(serverId, {
                serverId,
                config,
                projectRoot,
                fingerprint,
                generation,
                status: isOAuth ? "authorization-required" : "error",
                client: null,
                capabilities: emptyCapabilities(),
                toolDefinitions: [],
                activeCalls: 0,
                isDraining: false,
                lastError: this.safeError(error, config),
            });
        }
    }
    /**
     * 在当前有效连接记录上执行操作，并统一处理 generation、取消和脱敏边界。
     *
     * @param params 服务定位参数。
     * @param operation 需要访问当前服务记录和取消信号的操作。
     * @returns 操作结果的脱敏投影。
     */
    async withCurrentRecord(params, operation) {
        this.assertOpen();
        const record = this.requireConnected(params);
        const generation = record.generation;
        record.activeCalls += 1;
        try {
            const result = await this.requestRegistry.runCancelable(params.requestId, record.serverId, (signal) => operation(record, signal));
            this.assertCurrent(record.serverId, generation, record);
            return sanitizeSerializable(result, collectConfigSecrets(record.config));
        }
        catch (error) {
            if (error instanceof McpHelperError)
                throw error;
            if (this.isAbortError(error)) {
                throw new McpHelperError("MCP_REQUEST_CANCELLED", "MCP 请求已取消。");
            }
            throw new McpHelperError("MCP_OPERATION_FAILED", this.safeError(error, record.config));
        }
        finally {
            record.activeCalls -= 1;
            if (record.isDraining && record.activeCalls === 0) {
                void this.closeRecord(record, true);
            }
        }
    }
    /**
     * 获取已连接且 generation 匹配的服务记录。
     *
     * @param params 服务定位参数。
     * @returns 当前可用的服务记录。
     * @throws McpHelperError 服务不存在、未连接或 generation 过期时抛出。
     */
    requireConnected(params) {
        const record = this.requireRecord(params.serverId);
        if (params.generation !== undefined && params.generation !== record.generation) {
            throw new McpHelperError("MCP_STALE_GENERATION", "MCP connection generation 已失效。");
        }
        if (!record.client || record.status !== "connected") {
            throw new McpHelperError("MCP_SERVER_NOT_CONNECTED", `MCP 服务 ${params.serverId} 未连接。`);
        }
        return record;
    }
    /**
     * 读取 OAuth start 参数。
     *
     * @param params helper RPC 入参。
     * @returns 归一化后的 OAuth start 参数。
     */
    readOAuthStartParams(params) {
        if (!isRecord(params)) {
            throw new McpHelperError("MCP_INVALID_PARAMS", "OAuth params 必须是对象。");
        }
        return {
            serverId: requireString(params.serverId, "serverId"),
            redirectUrl: requireString(params.redirectUrl, "redirectUrl"),
        };
    }
    /**
     * 读取 OAuth finish 参数。
     *
     * @param params helper RPC 入参。
     * @returns 归一化后的 OAuth finish 参数。
     */
    readOAuthFinishParams(params) {
        const start = this.readOAuthStartParams(params);
        const typed = params;
        return {
            ...start,
            code: requireString(typed.code, "code"),
            state: requireString(typed.state, "state"),
        };
    }
    /**
     * 获取 direct OAuth 服务记录，并拒绝 stdio 或非 OAuth 服务。
     *
     * @param serverId MCP 服务 id。
     * @returns 带 direct HTTP/SSE OAuth 配置类型收窄的服务记录。
     */
    requireOAuthRecord(serverId) {
        const record = this.requireRecord(serverId);
        if ("command" in record.config || record.config.auth?.type !== "oauth") {
            throw new McpHelperError("MCP_INVALID_PARAMS", `MCP 服务 ${serverId} 不是 direct OAuth 服务。`);
        }
        return record;
    }
    /**
     * 获取父进程 OAuth 委托。
     *
     * @returns OAuth 请求委托函数。
     * @throws McpHelperError 未配置 OAuth 委托时抛出。
     */
    requireOAuthRequester() {
        if (!this.options.requestOAuth) {
            throw new McpHelperError("MCP_OAUTH_UNSUPPORTED", "MCP OAuth 主进程委托未配置。");
        }
        return this.options.requestOAuth;
    }
    /**
     * 获取可刷新能力的当前服务记录。
     *
     * @param params 服务定位参数。
     * @returns 已连接且未处于 OAuth 待授权状态的服务记录。
     */
    requireRefreshable(params) {
        const record = this.requireRecord(params.serverId);
        if (params.generation !== undefined && params.generation !== record.generation) {
            throw new McpHelperError("MCP_STALE_GENERATION", "MCP connection generation 已失效。");
        }
        if (record.status === "authorization-required") {
            throw new McpHelperError("MCP_OAUTH_UNSUPPORTED", "Direct MCP OAuth 尚未完成授权委托，无法刷新。");
        }
        if (!record.client || record.status !== "connected") {
            throw new McpHelperError("MCP_SERVER_NOT_CONNECTED", `MCP 服务 ${params.serverId} 未连接。`);
        }
        return record;
    }
    /**
     * 断言异步操作仍属于当前服务 generation。
     *
     * @param serverId MCP 服务 id。
     * @param generation 操作开始时记录的 generation。
     * @param record 操作开始时持有的服务记录。
     */
    assertCurrent(serverId, generation, record) {
        if (this.records.get(serverId) !== record || record.generation !== generation || record.isDraining) {
            throw new McpHelperError("MCP_STALE_GENERATION", "MCP connection generation 已失效。");
        }
    }
    /**
     * 获取已登记的服务记录。
     *
     * @param serverId MCP 服务 id。
     * @returns 服务记录。
     * @throws McpHelperError 服务不存在时抛出。
     */
    requireRecord(serverId) {
        const record = this.records.get(serverId);
        if (!record) {
            throw new McpHelperError("MCP_SERVER_NOT_FOUND", `MCP 服务 ${serverId} 不存在。`);
        }
        return record;
    }
    /**
     * 关闭服务记录中的 MCP client，并支持旧 generation 活动调用 drain。
     *
     * @param record 待关闭的服务记录。
     * @param force 是否立即关闭而不等待活动调用结束。
     */
    async closeRecord(record, force) {
        if (!record.client)
            return;
        disposeClientDiagnostics(record.client);
        if (!force && record.activeCalls > 0) {
            record.isDraining = true;
            record.closeTimer = setTimeout(() => {
                void this.closeRecord(record, true);
            }, DRAIN_TIMEOUT_MS);
            return;
        }
        if (record.closeTimer) {
            clearTimeout(record.closeTimer);
            record.closeTimer = undefined;
        }
        const client = record.client;
        record.client = null;
        record.isDraining = true;
        await client.close().catch(() => undefined);
    }
    /**
     * 把内部服务记录转换为可返回给父进程的脱敏状态。
     *
     * @param record 内部服务记录。
     * @returns helper RPC 服务状态快照。
     */
    toStatus(record) {
        const diagnostics = readClientDiagnostics(record.client);
        const secrets = collectConfigSecrets(record.config);
        return {
            serverId: record.serverId,
            permission: permissionOf(record.config),
            transport: transportOf(record.config),
            status: record.status,
            generation: record.generation,
            lastSuccessfulAt: record.lastSuccessfulAt,
            lastError: record.lastError,
            capabilities: {
                tools: record.capabilities.tools.map((item) => sanitizeToolCapability(item, secrets)),
                resources: sanitizeSerializable(record.capabilities.resources, secrets),
                resourceTemplates: sanitizeSerializable(record.capabilities.resourceTemplates, secrets),
                prompts: sanitizeSerializable(record.capabilities.prompts, secrets),
                diagnostics: sanitizeSerializable(diagnostics, secrets),
            },
        };
    }
    /**
     * 将未知错误归一化为稳定、脱敏的 helper 错误摘要。
     *
     * @param error 外部 SDK 或 helper 内部抛出的错误。
     * @param config 当前服务配置，用于收集脱敏敏感值。
     * @returns 不包含凭证和完整外部响应体的错误摘要。
     */
    safeError(error, config) {
        if (error instanceof McpHelperError) {
            return `${error.errorCode}: ${redactText(error.message, collectConfigSecrets(config))}`;
        }
        const message = redactText(readErrorMessage(error), collectConfigSecrets(config));
        const code = readErrorCodeText(error);
        const details = [code, message].filter((item) => !!item).join(" ");
        return details.length > 0
            ? `MCP_CONNECTION_FAILED: MCP 服务连接失败：${details}`
            : "MCP_CONNECTION_FAILED: MCP 服务操作失败。";
    }
    /**
     * 断言 helper session 仍可接受操作。
     *
     * @throws McpHelperError session 已关闭时抛出。
     */
    assertOpen() {
        if (this.isClosed) {
            throw new McpHelperError("MCP_HELPER_CLOSED", "MCP helper session 已关闭。");
        }
    }
    /**
     * 判断未知错误是否为外部 SDK 抛出的 AbortError。
     *
     * @param error 待判断的错误。
     * @returns 错误名称为 `AbortError` 时返回 `true`。
     */
    isAbortError(error) {
        return error instanceof Error && error.name === "AbortError";
    }
}

const parentRequests = new Map();
let nextParentRequestId = 1;
/**
 * 向父进程发起反向 helper RPC 请求，并等待父进程响应。
 *
 * @param method 父进程处理的方法名。
 * @param params 请求参数。
 * @returns 父进程返回的 result。
 */
function requestParent(method, params) {
    if (typeof process.send !== "function" || !process.connected) {
        return Promise.reject(new Error("MCP helper parent IPC 不可用。"));
    }
    const id = nextParentRequestId++;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            parentRequests.delete(id);
            reject(new Error(`MCP helper parent RPC "${method}" 超时。`));
        }, 5 * 60 * 1000);
        parentRequests.set(id, { resolve, reject, timer });
        process.send?.({ jsonrpc: "2.0", id, method, params });
    });
}
const session = new McpSessionManager(createSdkMcpClientFactory(), {
    requestElicitation: (request) => requestParent("elicitation/create", request),
    requestOAuth: (request) => requestParent("oauth/request", request),
});
const handleRequest = createMcpHelperRpcHandler(session);
/**
 * 通过 Node 子进程 IPC 向父进程发送消息。
 *
 * @param message 待发送消息。
 */
function send(message) {
    if (typeof process.send === "function") {
        process.send(message);
    }
}
process.on("message", (message) => {
    if (message &&
        typeof message === "object" &&
        message.jsonrpc === "2.0" &&
        typeof message.id === "number" &&
        ("result" in message || "error" in message)) {
        const response = message;
        const pending = parentRequests.get(response.id);
        if (!pending)
            return;
        parentRequests.delete(response.id);
        clearTimeout(pending.timer);
        if ("error" in response) {
            pending.reject(new Error(response.error.message));
        }
        else {
            pending.resolve(response.result);
        }
        return;
    }
    if (!isHelperRpcRequest(message)) {
        return;
    }
    void handleRequest(message).then((response) => {
        send(response);
        if (message.method === "shutdown" && "result" in response) {
            setTimeout(() => process.exit(0), 0);
        }
    });
});
process.on("disconnect", () => {
    for (const [id, pending] of parentRequests.entries()) {
        parentRequests.delete(id);
        clearTimeout(pending.timer);
        pending.reject(new Error("MCP helper parent IPC 已断开。"));
    }
    void session.shutdown().finally(() => process.exit(0));
});
