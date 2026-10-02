#!/bin/sh
# Standalone TypeScript checks and deterministic AudioSource mock; no install/build/server.
set -eu
PROJECT=/Users/zhengwenjun/tiaoyitiao
cd "$PROJECT"
node -e 'if(require("./package.json").uuid!=="4856b445-bfe4-49c2-8933-59e229f06792") process.exit(2)'
: "${1:?Pass current authorized session scratch/stage04-audio-test}"
OUT=$1
case "$OUT" in /private/var/folders/*/session-*/stage04-audio-test) ;; *) echo 'OUT must be current authorized session scratch/stage04-audio-test' >&2; exit 2 ;; esac
mkdir -p "$OUT"
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
export JUMP_AUDIO_TSC_VERSION="$(node "$TSC" --version)"
export JUMP_AUDIO_OUT="$OUT"
# Scratch config inherits the real Creator declarations; strictly checks only the owned adapter.
node -e 'const fs=require("fs");fs.writeFileSync(process.env.JUMP_AUDIO_OUT+"/engine-typecheck.json",JSON.stringify({extends:process.cwd()+"/tsconfig.json",compilerOptions:{strict:true,noEmit:true,skipLibCheck:true,types:["cc.custom-macro","jsb","cc","cc.env"].map(name=>process.cwd()+"/temp/declarations/"+name)},files:[process.cwd()+"/assets/scripts/jump/adapters/AudioAdapter.ts"],include:[]}))'
export JUMP_AUDIO_ENGINE_CHECK="node '$TSC' -p '$OUT/engine-typecheck.json'"
node "$TSC" -p "$OUT/engine-typecheck.json"
export JUMP_AUDIO_COMPILE_COMMAND="node '$TSC' --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --rootDir . --outDir '$OUT' tests/jump/audio-mocks/cc.d.ts tests/jump/stage04-audio-tests.ts"
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --rootDir . --outDir "$OUT" tests/jump/audio-mocks/cc.d.ts tests/jump/stage04-audio-tests.ts
export JUMP_AUDIO_EXECUTE_COMMAND="NODE_PATH='$PROJECT/tests/jump/audio-mocks' node '$OUT/tests/jump/stage04-audio-tests.js' --evidence"
NODE_PATH="$PROJECT/tests/jump/audio-mocks" node "$OUT/tests/jump/stage04-audio-tests.js" --evidence
