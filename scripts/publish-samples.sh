#!/usr/bin/env bash
# ClaudeTraining/samples の内容(common-web + gas-backup)を
# 公開用リポジトリ minitask-handson へ反映するスクリプト。
#
# INSTRUCTOR_NOTES.md は意図的に除外する(答え漏洩防止)。
# 編集は必ず ClaudeTraining 側のみで行い、このスクリプトで publish すること。
set -euo pipefail

REPO_URL="https://github.com/GochaLearningSpace/minitask-handson.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../samples"
WORK_DIR="$(mktemp -d)"

cleanup() { rm -rf "$WORK_DIR"; }
trap cleanup EXIT

echo "clone: $REPO_URL"
git clone --quiet "$REPO_URL" "$WORK_DIR"

# 既存内容を一度クリアしてから最新をコピー(削除したファイルにも追従させるため)
rm -rf "$WORK_DIR/common-web" "$WORK_DIR/gas-backup"
mkdir -p "$WORK_DIR/common-web" "$WORK_DIR/gas-backup"

cp -r "$SRC_DIR/common-web/routes" "$SRC_DIR/common-web/lib" "$SRC_DIR/common-web/data" "$SRC_DIR/common-web/public" "$SRC_DIR/common-web/exercises" "$WORK_DIR/common-web/"
cp "$SRC_DIR/common-web/package.json" "$SRC_DIR/common-web/server.js" "$SRC_DIR/common-web/.env.example" "$SRC_DIR/common-web/.gitignore" "$SRC_DIR/common-web/README.md" "$WORK_DIR/common-web/"
# INSTRUCTOR_NOTES.md はコピーしない(意図的)

# training-concepts skill(トレーニーが概念質問できるQ&Aスキル)は配布対象
cp -r "$SRC_DIR/common-web/.claude" "$WORK_DIR/common-web/.claude"

cp -r "$SRC_DIR/gas-backup/." "$WORK_DIR/gas-backup/"
cp "$SRC_DIR/README.md" "$WORK_DIR/README.md"

cd "$WORK_DIR"
git add -A

if git diff --cached --quiet; then
  echo "変更なし。publish 不要。"
  exit 0
fi

git -c user.name="GochaLearningSpace" -c user.email="takashi_ichimasa@silverhomuradev.com" \
  commit -q -m "sync: update MiniTask samples from ClaudeTraining

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push -q origin master
echo "push 完了。"
