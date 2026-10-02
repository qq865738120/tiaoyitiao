#!/bin/sh
# No install, CLI, project build, scene/meta or resource mutation. JS is scratch-only.
set -eu
PROJECT=/Users/zhengwenjun/tiaoyitiao
cd "$PROJECT"
node -e 'if(require("./package.json").uuid!=="4856b445-bfe4-49c2-8933-59e229f06792") process.exit(2)'
: "${1:?Pass authorized session scratch/stage04-view-test}"
OUT=$1
case "$OUT" in /private/var/folders/*/session-*/stage04-view-test) ;; *) echo 'Use current authorized session scratch/stage04-view-test' >&2; exit 2 ;; esac
TSC=/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/bin/tsc
export JUMP_VIEW_COMPILE_COMMAND="node '$TSC' --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --experimentalDecorators --rootDir . --outDir '$OUT' temp/declarations/cc.d.ts tests/jump/stage04-view-tests.ts assets/scripts/jump/view/AvatarView.ts assets/scripts/jump/view/JumpUI.ts assets/scripts/jump/view/BackgroundView.ts"
export JUMP_VIEW_EXECUTE_COMMAND="node '$OUT/tests/jump/stage04-view-tests.js' ${2:-}"
printf '%s\n' "$JUMP_VIEW_COMPILE_COMMAND"
node "$TSC" --strict --target ES2018 --module commonjs --moduleResolution node --lib ES2019,DOM --skipLibCheck --experimentalDecorators --rootDir . --outDir "$OUT" temp/declarations/cc.d.ts tests/jump/stage04-view-tests.ts assets/scripts/jump/view/AvatarView.ts assets/scripts/jump/view/JumpUI.ts assets/scripts/jump/view/BackgroundView.ts
printf '%s\n' "$JUMP_VIEW_EXECUTE_COMMAND"
node "$OUT/tests/jump/stage04-view-tests.js" "${2:-}"
