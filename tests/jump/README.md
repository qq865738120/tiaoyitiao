# jump 规则与适配测试（阶段01回归 + 阶段02）

职责：在 assets 外验证 core 配置、xorshift32、状态边界、时钟及阶段02真实Gameplay。core入口不加载 Creator/cc；独立adapter-tests使用仅测试用cc/DOM mock运行真实适配实现。不安装依赖、不执行项目构建。

适配入口：`sh tests/jump/adapter-mocks/run.sh '<当前授权scratch>/adapter-test'`。初次21项报告保留在 `docs/验收证据/阶段02适配测试.json`（20通过/1失败，P06遗漏Visual旋转）。修复后仅受影响平台项：`JUMP_ADAPTER_FILTER=P sh tests/jump/adapter-mocks/run.sh '<当前授权scratch>/adapter-test'`，输出独立 `阶段02平台回收复验.json`（7/7、2031断言）。输入14项未受修改影响，复用初次结果；不得覆盖初次失败或把mock当作真机/渲染验收。

阶段02入口 `stage02-tests.ts`：R01—12/R14/R15适用纯逻辑；独立基准、1000平台与实际偏脚底射线、边界/奖励/旧代际测试及整数tick至少20跳回放。先用下方同一tsc命令同时编译 `tests/jump/run-tests.ts tests/jump/stage02-tests.ts` 到当前scratch的 `core-test`。执行旧入口**不加 --evidence**（不覆盖阶段01报告）；再执行新入口 `node "$OUT/tests/jump/stage02-tests.js" --evidence` 写本阶段规则/回放JSON。源码哈希、实际命令、通过计数与首写transaction保存在新报告。

Gameplay的输入拥有者直接由唯一RunStateMachine约束，不新增第二套InputGate状态；测试覆盖重复、非owner、取消、飞行/落地/相机输入不缓存，pause取消charging/冻结airborne。阶段计时使用固定tick，事件只在drainEvents消费；实际鼠标/空格/触摸、音效、UI阻断与Creator连跳/视觉由父级实测，不在纯测试中标通过。

入口 `run-tests.ts` 使用轻量同步断言。前16个随机整数直接读取 `docs/数据/验收基准.json`，该文件为预计算期望，不是测试结果；前100个随机值另做同seed重现。该旧入口保留阶段01范围：测试不得把其中注入的分类/奖励声称为算法验收；阶段02真实算法由新入口验证。

## 阶段03独立入口

`stage03-tests.ts`编译真实无cc的StorageAdapter、JumpGameplay和RunStateMachine。R13注入get/set/remove故障、异常存档和无效score，验证max、写失败内存保留/重试、reset明确失败/成功及写失败后的真实新局；R12真实dispatch/guardCallback拒绝旧run/jump并验证Scored/Failed去重，Gameplay执行20轮重开→主页→开始（覆盖charging/airborne/landing/falling/paused），检查计划/owner/事件/结果清空及120tick无旧事件。仅代表纯逻辑，不证明真实输入监听、场景/Tween或音频清理；阶段03音频不标通过。

单独执行如下（新证据使用独占创建，已有同名报告时不加`--evidence`，不得覆盖历史）：

```sh
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
OUT='<当前会话scratch>/stage03-test'
node "$TSC" --strict --target ES2015 --module commonjs --moduleResolution node --skipLibCheck --noEmit assets/scripts/jump/adapters/StorageAdapter.ts
COMPILE="node $TSC --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir $OUT tests/jump/stage03-tests.ts"
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir "$OUT" tests/jump/stage03-tests.ts
JUMP_STAGE03_COMPILE_COMMAND="$COMPILE" node "$OUT/tests/jump/stage03-tests.js" --evidence
```

新报告为`docs/验收证据/阶段03纯逻辑测试.json`，含项目身份、源码哈希、实际命令、用例/断言计数和未覆盖层。`--evidence`仅记录实际本次执行，不写历史阶段01/02证据。

从工程根执行（OUT 为当前会话临时目录的 tests 编译子目录；不使用项目 tsconfig）：

```sh
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
OUT='<当前会话scratch>/core-test'
node "$TSC" --strict --target ES2015 --module commonjs --moduleResolution node --skipLibCheck --noEmit assets/scripts/jump/core/index.ts
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --skipLibCheck --rootDir . --outDir "$OUT" tests/jump/run-tests.ts tests/jump/stage02-tests.ts
JUMP_TEST_OUT="$OUT" node "$OUT/tests/jump/run-tests.js"
JUMP_TEST_OUT="$OUT" node "$OUT/tests/jump/stage02-tests.js" --evidence
```

测试输出逐项 PASS/FAIL 及 JSON 汇总，失败以非零状态退出。增加 `--evidence` 参数可将实际执行记录写至授权文件 `docs/验收证据/阶段01规则测试.json`；不带该参数只打印结果。Creator 预览不在本入口覆盖范围内。

本机已调查：PATH 没有 tsc；上述 Creator 自带 TypeScript 为 4.9.5，Node 为 v22.23.1。未安装依赖，未修改 package.json/扩展。完整实际编译、执行命令及源码哈希保存在证据 JSON。

历史阶段01额外执行了jump模块宿主类型检查（并非本轮新代码检查证据）：继承本工程tsconfig/Creator派生ES2015配置，严格模式、noEmit、skipLibCheck，范围仅assets/scripts/jump。首次状态机两处Array.includes报TS2550，改为等价indexOf后检查退出0，并重跑全部纯规则测试通过；不修改工程target。该检查不代表扩展或全仓typecheck。具体结果见docs/验收证据/阶段01场景核验.md。

旧入口补充测试覆盖整数/有限值配置约束、两实例100随机值与共同first16、状态全路径、同输入拥有者、charge暂停取消、飞行暂停tick、旧run/jump和事件边界、5tick上限、积压冻结与显式分帧恢复、resume首帧不补后台、30/60/120 FPS时钟。所有计划与落点分类都是测试注入；不宣称完成阶段02奖励/碰撞/回放验收。
