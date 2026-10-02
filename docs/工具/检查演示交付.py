#!/usr/bin/env python3
"""只读核验公开演示插件与四阶段历史，不加载 Creator 或修改运行数据。"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]


def digest(content):
    """计算文件字节的 SHA-256，不归一化历史正文。"""
    return hashlib.sha256(content).hexdigest()


def git_files(area):
    """列出 Git 已跟踪或允许新增的文件，并排除已删除文件。"""
    result = subprocess.run(
        ['git', 'ls-files', '-c', '-o', '--exclude-standard', '-z', '--', area],
        cwd=ROOT, check=True, capture_output=True)
    return {name for name in result.stdout.decode().split('\0')
            if name and (ROOT / name).is_file()}


def main():
    """核对冻结清单、会话与图片合同、插件闭包和 Git 放行边界。"""
    manifest = json.loads((ROOT / 'docs/数据/演示会话清单.json').read_text())
    expected = manifest['files']
    assert manifest['schemaVersion'] == 1
    assert len(expected) == 287
    for name, sha in expected.items():
        target = ROOT / name
        assert not target.is_symlink() and target.is_file(), name
        assert digest(target.read_bytes()) == sha, f'归档哈希不一致：{name}'
    assert git_files('.gameagent/.data') == set(expected), 'Git历史范围与归档清单不一致'

    session = ROOT / '.gameagent/.data/session'
    marker = json.loads((session.parent / 'layout.json').read_text())
    assert marker == {'schema': 'game-agent.project-data', 'version': 1}
    index = json.loads((session / 'index.json').read_text())
    phases = manifest['phases']
    assert index['version'] == 2 and len(index['sessions']) == len(phases) == 4
    assert [p['phase'] for p in phases] == [1, 2, 3, 4]
    assert {s['id'] for s in index['sessions']} == {p['sessionId'] for p in phases}
    previews = 0
    for phase in phases:
        record = json.loads((ROOT / phase['record']).read_text())
        sid = phase['sessionId']
        assert record['schemaVersion'] == 3 and record['id'] == sid
        assert f"阶段{phase['phase']:02}" in record['title']
        assert len(record['messages']) == phase['messages']
        assert isinstance(record['taskState'], dict)
        assert isinstance(record['steeringMessages'], list)
        assert isinstance(record['userInteractions'], list)
        for message in record['messages']:
            assert message['role'] in ('user', 'assistant', 'system')
            assert isinstance(message['id'], str) and isinstance(message['parts'], list)
        metadata = list((session / 'images' / sid).glob('*/metadata.json'))
        assert len(metadata) == phase['previewImages']
        previews += len(metadata)
        for image in metadata:
            info = json.loads(image.read_text())
            for field in ('original', 'display', 'thumbnail'):
                item = info[field]
                assert Path(item['fileName']).name == item['fileName']
                content = (image.parent / item['fileName']).read_bytes()
                assert len(content) == item['sizeBytes'] and digest(content) == item['sha256']
    assert previews == 66

    extension = ROOT / 'extensions/game-agent-demo'
    integrity = json.loads((extension / 'demo-integrity.json').read_text())
    package = json.loads((extension / 'package.json').read_text())
    assert package['name'] == 'game-agent-demo' and package['version'] == '0.4.0'
    assert set(package['contributions']['messages']) == {'open-panel', 'open-purchase'}
    installed = {str(p.relative_to(extension)) for p in extension.rglob('*') if p.is_file()}
    assert installed == set(integrity) | {'demo-integrity.json'}
    assert git_files('extensions/game-agent-demo') == {
        'extensions/game-agent-demo/' + name for name in installed}
    for name, sha in integrity.items():
        assert digest((extension / name).read_bytes()) == sha, name
    archive = manifest['pluginArchive']
    content = (ROOT / archive['path']).read_bytes()
    assert len(content) == archive['bytes'] and digest(content) == archive['sha256']
    with zipfile.ZipFile(ROOT / archive['path']) as z:
        members = {i.filename for i in z.infolist() if not i.is_dir()}
        assert members == {'game-agent-demo/' + name for name in installed}
        for name in installed:
            assert z.read('game-agent-demo/' + name) == (extension / name).read_bytes()

    private = ['settings/v2/packages/game-agent.json', 'extensions/game-agent/package.json',
               '.gameagent/.data/session/workspace.json',
               '.gameagent/.data/session/records/private-session.json',
               '.gameagent/.data/session/recovery/private.json']
    private += ['.gameagent/.data/' + area + '/private.json' for area in
                ('bash', 'tool-transactions', 'memorys', 'game-assets', 'game-tests',
                 'workflow-runtime', 'package-intake-broker')]
    for name in private:
        result = subprocess.run(['git', 'check-ignore', '--no-index', '-q', name], cwd=ROOT)
        assert result.returncode == 0, f'私有文件未忽略：{name}'
    secrets = re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|'
                         r'\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}|'
                         r'gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b')
    for name in expected:
        if Path(name).suffix in ('.json', '.jsonl', '.md'):
            assert not secrets.search((ROOT / name).read_text()), f'疑似凭据：{name}'
    print(json.dumps({'ok': True, 'phases': 4, 'archiveFiles': len(expected),
                      'previewImages': previews, 'pluginFiles': len(installed),
                      'zipBytes': len(content), 'gitBoundary': 'passed'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
