#!/usr/bin/env python3
"""Read-only baseline verification. Does not execute any game implementation."""
from pathlib import Path
import json, hashlib, sys, re

ROOT = Path(__file__).resolve().parents[2]
errors = []
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def fail(text): errors.append(text)
def files(root):
    return {str(p.relative_to(root)): digest(p) for p in root.rglob('*')
            if p.is_file() and p.name != '.DS_Store'}

baseline = json.loads((ROOT/'docs/数据/共享基线.json').read_text())
inventory = json.loads((ROOT/'docs/数据/素材使用清单.json').read_text())
assert len(inventory) == 250
for row in baseline['assets']:
    p=ROOT/row['path']
    if not p.is_file(): fail('缺失基线文件：'+row['path'])
    elif digest(p)!=row['sha256']: fail('基线文件变化：'+row['path'])

imported = 0
missing_library=[]
for row in inventory:
    p=ROOT/row['asset_path']; meta=Path(str(p)+'.meta')
    if not p.exists() or not meta.exists(): fail('缺素材/metadata：'+row['asset_path']); continue
    d=json.loads(meta.read_text())
    if digest(p)!=row['sha256']:fail('素材内容与清单不符：'+row['asset_path'])
    if d['uuid']!=row['uuid']: fail('UUID变化：'+row['asset_path'])
    actual_subassets={v['uuid'] for v in d.get('subMetas',{}).values()}
    if actual_subassets!={v['uuid'] for v in row['subassets']}:fail('子资源UUID变化：'+row['asset_path'])
    if not d.get('imported'):fail('未导入：'+row['asset_path'])
    original=ROOT/row['source_in_project']
    if not original.is_file() or digest(original)!=row['sha256']:
        fail('参考来源缺失或内容不符：'+row['asset_path'])
    def verify_library(v):
        for ext in v.get('files',[]):
            base=ROOT/'library'/v['uuid'][:2]
            f=base/(v['uuid']+ext) if ext.startswith('.') else base/v['uuid']/ext
            if not f.is_file():missing_library.append(str(f.relative_to(ROOT)))
        for child in v.get('subMetas',{}).values():verify_library(child)
    if (ROOT/'library').is_dir():verify_library(d)
    imported += int(bool(d.get('imported')))

commands=json.loads((ROOT/'docs/数据/命令清单.json').read_text())
assert len(commands)==4
expected_commands={c['file'] for c in commands}
actual_commands={str(p.relative_to(ROOT)) for p in (ROOT/'.gameagent/commands').glob('jump-phase-*.md')}
if actual_commands!=expected_commands:fail('阶段命令目录有缺失或旧文件')
if len(list((ROOT/'docs/实施阶段').glob('阶段*.md')))!=4:fail('阶段文档数量应为4')
if len(list((ROOT/'docs/阶段提示词').glob('阶段*.md')))!=4:fail('阶段提示词数量应为4')
for c in commands:
    raw=(ROOT/c['file']).read_text(); parts=raw.split('\n---\n',1)
    if not raw.startswith('---\n') or len(parts)!=2:fail('命令frontmatter：'+c['id']);continue
    body=parts[1]
    fields={}
    for line in parts[0][4:].splitlines():
        key,sep,value=line.partition(':')
        if sep:
            try:fields[key]=json.loads(value.strip())
            except Exception:fail('命令字段：'+c['id'])
    if fields.get('id')!=c['id'] or fields.get('name')!=c['name']:fail('命令身份：'+c['id'])
    if not re.fullmatch(r'[a-z][a-z0-9-]{0,63}',fields.get('id','')):fail('命令id格式：'+c['id'])
    if len(raw.encode())>65536 or not body.strip() or len(body)>16000:fail('命令长度：'+c['id'])
    if body!=(ROOT/c['prompt_doc']).read_text():fail('命令与阶段提示词不同：'+c['id'])
    if hashlib.sha256(body.encode()).hexdigest()!=c['prompt_sha256']:fail('命令正文哈希：'+c['id'])
    if not (ROOT/c['phase_doc']).is_file():fail('缺阶段文档：'+c['id'])
    if body not in (ROOT/'docs/阶段提示词.md').read_text():fail('汇总提示词不一致：'+c['id'])

for p in [ROOT/'README.md', ROOT/'AGENTS.md', *(ROOT/'docs').rglob('*.md')]:
    if '参考资料' in p.parts:continue
    for link in re.findall(r'!?\[[^\]]*\]\(([^\)]+)\)',p.read_text()):
        target=link.strip('<>').split('#',1)[0]
        if not target or '://' in target or target.startswith('mailto:'):continue
        if not (p.parent/target).exists():fail('文档链接缺失：'+str(p.relative_to(ROOT))+' -> '+target)

comparison=None
if len(sys.argv)>1:
    other=Path(sys.argv[1]).expanduser().resolve()
    if not (other/'package.json').exists():fail('对比路径不是Creator工程')
    else:
        comparison={}
        for area in ['assets','docs','.gameagent/commands','.gameagent/rules']:
            left=files(ROOT/area); right=files(other/area)
            differences=sorted(k for k in set(left)|set(right) if left.get(k)!=right.get(k))
            comparison[area]={'files':len(left),'equal':not differences,'differences':differences}
            if differences:fail('两工程目录不同：'+area)
        for area in ['README.md','AGENTS.md']:
            if digest(ROOT/area)!=digest(other/area):fail('两工程文档不同：'+area)
        own=json.loads((ROOT/'package.json').read_text()); peer=json.loads((other/'package.json').read_text())
        if own['uuid']==peer['uuid']:fail('两个项目UUID不应相同')

result={'project':str(ROOT),'assets':len(inventory),'imported_meta':imported,'commands':len(commands),
        'library_checked':(ROOT/'library').is_dir(),'library_missing_files':missing_library,
        'comparison':comparison,'errors':errors,
        'scope':'仅素材/文档/命令基线；不代表游戏实施或游戏验收通过'}
print(json.dumps(result,ensure_ascii=False,indent=2))
if errors or missing_library:sys.exit(1)
