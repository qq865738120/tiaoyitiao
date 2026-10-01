# jump 纯规则测试（阶段01）

职责：在 assets 外验证 core 配置、xorshift32、状态边界与时钟，不加载 Creator/cc，不安装依赖，不执行项目构建。

入口 `run-tests.ts` 使用轻量同步断言。前16个随机整数直接读取 `docs/数据/验收基准.json`，该文件为预计算期望，不是测试结果；前100个随机值另做同seed重现。阶段02的碰撞、平台生成、奖励算法尚未实现，测试不得把注入的分类/奖励声称为算法验收。

从工程根执行（OUT 为当前会话临时目录的 tests 编译子目录；不使用项目 tsconfig）：

```sh
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
OUT='<当前会话scratch>/jump-core-tests'
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir "$OUT" tests/jump/run-tests.ts
node "$OUT/tests/jump/run-tests.js"
```

测试输出逐项 PASS/FAIL 及 JSON 汇总，失败以非零状态退出。实际执行记录写至 `docs/验收证据/阶段01-规则结果.json`；Creator 预览不在本入口覆盖范围内。
