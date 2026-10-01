# cocos-doc-skill Eval Viewer

## Scope

This reviewer file pairs with `routing-eval.json`. It is not a runtime artifact; it records how to inspect whether the skill routes Cocos Creator 3.8 questions to the right documents and whether answers obey the skill contract.

## Automated Checks

Run from the repository root:

```bash
npm run cocos-doc-skill:validate:full
git diff --check
```

Expected result on 2026-06-22:

- `cocos-doc-skill:validate:full`: pass.
- Routing regression: 107 / 107 hits, 100.0% hit rate.
- Public export check: enhanced hit rate 100.0%, zero missing public exports.
- `git diff --check`: pass.

Known non-blocking warnings:

- Generated aggregate routing files exceed the soft file-budget warning; shard consistency is validated.
- Some pre-existing docs remain above the 200-line content-quality soft warning; all docs are below the 300-line hard routing limit.

## Manual Review Questions

Use `scripts/route-query.js` first, then `scripts/search-docs.js` when the query is broad:

```bash
node static/skills/cocos-doc-skill/scripts/route-query.js --query "编辑器扩展脚本 Editor.Message 怎么用" --json
node static/skills/cocos-doc-skill/scripts/search-docs.js --query "属性检查器绑定 Label" --limit 8 --json
```

Reviewers should check:

- The answer reads at least one matched document before giving concrete API guidance.
- API facts come from `api-reference/` when a public symbol is involved.
- Editor-only APIs such as `Editor.Message` are not presented as runtime `cc` APIs.
- TypeScript examples import from `cc`, use `_decorator`, and null-check component references.
- `needs-review` documents trigger an explicit review caveat in the answer.

## Representative Cases

| Query | Expected Route |
|---|---|
| 动画播完之后没有回调 | `troubleshooting/animation-event-not-fired.md` or `recipes/animation-event-callback.md` |
| Widget停靠对齐 | `ui-2d/widget.md` |
| Collider2D 碰撞器 | `api-reference/collider-2d.md` |
| Bundle 分包机制 | `assets/asset-bundle.md` or `assets/subpackage.md` |
| RenderTexture Android blendState 报错 | `troubleshooting/render-texture-blend-state.md` and needs-review warning |
