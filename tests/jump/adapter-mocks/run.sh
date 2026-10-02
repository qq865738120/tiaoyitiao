#!/bin/sh
# Standalone, no install/build/meta or scene operations. Scratch-only generated JS.
set -eu
PROJECT=/Users/zhengwenjun/tiaoyitiao
cd "$PROJECT"
node -e 'if(require("./package.json").uuid!=="4856b445-bfe4-49c2-8933-59e229f06792") process.exit(2)'
: "${1:?Pass the current authorized scratch/adapter-test output directory}"
OUT=$1
case "$OUT" in /private/var/folders/*/session-*/adapter-test) ;; *) echo 'OUT must be the authorized current session scratch/adapter-test' >&2; exit 2 ;; esac
export JUMP_ADAPTER_PRE_HASHES="$(node -e 'const fs=require("fs"),c=require("crypto"); const paths=["assets/scripts/jump/adapters/InputAdapter.ts","assets/scripts/jump/view/PlatformPool.ts","assets/scripts/jump/view/PlatformView.ts","assets/scripts/jump/core/config.ts","assets/scripts/jump/core/types.ts"]; console.log(JSON.stringify(Object.fromEntries(paths.map(p=>[p,c.createHash("sha256").update(fs.readFileSync(p)).digest("hex")]))))')"
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
export JUMP_ADAPTER_OUT="$OUT"
export JUMP_ADAPTER_TSC_VERSION="$(node "$TSC" --version)"
export JUMP_ADAPTER_COMPILE_COMMAND="node '$TSC' --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --experimentalDecorators --rootDir . --outDir '$OUT' tests/jump/adapter-mocks/cc.d.ts tests/jump/adapter-tests.ts"
export JUMP_ADAPTER_EXECUTE_COMMAND="NODE_PATH='$PROJECT/tests/jump/adapter-mocks' JUMP_ADAPTER_OUT='$OUT' node '$OUT/tests/jump/adapter-tests.js' --evidence"
printf '%s\n' "$JUMP_ADAPTER_COMPILE_COMMAND"
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --experimentalDecorators --rootDir . --outDir "$OUT" tests/jump/adapter-mocks/cc.d.ts tests/jump/adapter-tests.ts
printf '%s\n' "$JUMP_ADAPTER_EXECUTE_COMMAND"
NODE_PATH="$PROJECT/tests/jump/adapter-mocks" node "$OUT/tests/jump/adapter-tests.js" --evidence
