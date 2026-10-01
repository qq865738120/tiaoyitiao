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

测试输出逐项 PASS/FAIL 及 JSON 汇总，失败以非零状态退出。增加 `--evidence` 参数可将实际执行记录写至授权文件 `docs/验收证据/阶段01规则测试.json`；不带该参数只打印结果。Creator 预览不在本入口覆盖范围内。

本机已调查：PATH 没有 tsc；上述 Creator 自带 TypeScript 为 4.9.5，Node 为 v22.23.1。未安装依赖，未修改 package.json/扩展。完整实际编译、执行命令及源码哈希保存在证据 JSON。

额外执行了jump模块宿主类型检查：继承本工程tsconfig/Creator派生ES2015配置，严格模式、noEmit、skipLibCheck，范围仅assets/scripts/jump。首次状态机两处Array.includes报TS2550，改为等价indexOf后检查退出0，并重跑全部纯规则测试通过；不修改工程target。该检查不代表扩展或全仓typecheck。具体结果见docs/验收证据/阶段01场景核验.md。

补充测试覆盖整数/有限值配置约束、两实例100随机值与共同first16、状态全路径、同输入拥有者、charge暂停取消、飞行暂停tick、旧run/jump和事件边界、5tick上限、积压冻结与显式分帧恢复、resume首帧不补后台、30/60/120 FPS时钟。所有计划与落点分类都是测试注入；不宣称完成阶段02奖励/碰撞/回放验收。
