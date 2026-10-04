# 講師専用メモ(トレーニーに配布しない)

MiniTask に仕込んである教育用の仕掛け一覧。各セクションでこれを「発見させる」流れにする。
曖昧さを無くすため、各仕掛けは「ファイル:行番号」「現在の実際の値」「確認コマンドと期待される出力」「見つからなかった時に読み上げる誘導質問」をセットで書く。

---

## ⚠️ Harness/Log Engineering のhookでハマりやすい3点(実際に本番前リハーサルで発生した事象)

1. **トレーニーがClaude Codeに「編集して」と頼んでも、Editツールではなく Bash(`echo`/`sed`等)で処理してしまうことがある**。hookのmatcherが `"Edit|Write"` のままだと発火しない。
   → **対策済み**: matcherを `"Edit|Write|Bash"` に広げてある(どのツールが選ばれても発火する)。これより狭いmatcherに戻さないこと。

2. **PowerShellで `.claude/settings.json` を手打ちすると、`Set-Content -Encoding utf8` がファイル先頭にBOM(見えない制御文字)を付与し、JSONとして壊れる**。見た目は正常に見えるが、Claude CodeはこのJSONを読み込めず、hookが一切発火しない(エラーも出ないので非常に気づきにくい)。
   - 確認コマンド: `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"` → BOM付きだと `Unexpected token '﻿'` のようなエラーが出る
   - 対策: 可能な限り `cp exercises/.../*.json .claude/settings.json` で済ませる(手打ち不要)。どうしても手打ちさせる場合はPowerShellで `-Encoding ascii` を使わせる

3. **(根本対策・2026-10-04実施)hookの実行コマンドをJSON内の長い1行(`node -e "..."`)として埋め込む設計そのものが、bash/PowerShell/cmdでクォートの扱いが違い壊れやすかった**(実際に `PostToolUse:Bash hook error / Failed with non-blocking status code: [eval]:1` が発生)。
   → **対策済み**: ロジックを実ファイル `.claude/hooks/harness-hook.js`(2.用)/`.claude/hooks/log-hook.js`(5.用)に切り出し、`settings.json` からは `"command": "node .claude/hooks/harness-hook.js"` のように**引用符を一切含まない1トークン**で呼ぶ設計に変更した。`exercises/harness-settings/*.json` と `exercises/log-settings/*.json` は全てこの新設計に更新済み。**この2つの `.js` ファイルは `samples/common-web/.claude/hooks/` に必ず残しておくこと**(削除するとhookが動かなくなる)。

---

## 仕掛け1: 弱いフォールバック秘密情報

**場所**: `routes/tasks.js` 16行目
```js
const expected = process.env.ADMIN_KEY || "changeme123"; // ← 意図的な弱いフォールバック
```

**何が問題か**: `.env` ファイルを作り忘れても、管理者キーが `"changeme123"` という固定値で動いてしまう。`.env.example`(6行目)には別のプレースホルダー `your-secret-key-here` が書いてあるので、`.env.example` を見ただけでは実際のフォールバック値には気づけない。コード(`routes/tasks.js` 16行目)を読まないと分からない設計。

**使うセクション**:
- 7. Security Step 1(`/security-review` 実行で発見させる。本命)
- 2. Harness Engineering(直接は関係ないが、`permissions.allow` に `Edit(routes/tasks.js)` 等を含めていないと、Step 1でこのファイルを直接見られないトレーニーが出るので注意)

**確認コマンド(講師が事前に動作確認する時用)**:
```bash
cd samples/common-web
rm -f .env   # .env が無い状態を再現
npm start &
curl -X DELETE http://localhost:3000/api/tasks/1 -H "x-admin-key: changeme123"
# 期待: 200 OKでタスクが削除される(本来は401/403になってほしいのに通ってしまう)
kill %1
cp .env.example .env   # 元に戻す(中身は自分で ADMIN_KEY を設定すること)
```

**見つからなかった場合に読み上げる誘導質問**: 「管理者用の操作(DELETE)、`.env` を作り忘れたらどうなると思う? 実際に `.env` を一時的にリネームして試してみて」

**トレーニーに直させる修正例**:
```js
function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    throw new Error("ADMIN_KEY が設定されていません。.env を確認してください。");
  }
  const provided = req.header("x-admin-key");
  if (provided !== expected) {
    return res.status(403).json({ error: "admin key required" });
  }
  next();
}
```
(起動時チェックにしたい場合は `server.js` の先頭で `if (!process.env.ADMIN_KEY) throw ...` でも可)

---

## 仕掛け2: 過剰権限settings.json(Harness Engineeringの演習そのもの)

**場所**: トレーニー自身がその場で書く。リポジトリには常設しない(安全な設計の実例として、過剰権限設定を「デフォルト」として配布するのは不適切なため)。

**代わりに用意してある参照ファイル**: `samples/common-web/exercises/harness-settings/`
| ファイル | 内容 |
|---|---|
| `step1-before.json` | `{}`(hookなし。初期状態) |
| `step1-after.json` | hookのみ追加(2. Step 1完了形) |
| `step2-before.json` | hook + 過剰権限 `["Bash(*)", "WebFetch(*)", "Write(*)"]`(2. Step 2の「わざと壊す」状態) |
| `step2-after.json` | hook + 最小権限 `["Bash(npm run *)", "Bash(git *)", "Edit(samples/common-web/**)"]`(2. Step 2の完成形) |

**進行手順(materials/02-harness-engineering.md と同じ)**:
1. トレーニーに `step2-before.json` の中身(過剰権限)を自分の `.claude/settings.json` に手打ちまたは `cp exercises/harness-settings/step2-before.json .claude/settings.json` で反映させる
2. 「このエージェントに今、何ができてしまうか?」を議論(任意コマンド実行・任意ファイル書き込み・外部通信が全部できる)
3. `step2-after.json` の内容に書き換えさせる(最小権限)

**使うセクション**:
- 2. Harness Engineering Step 2(演習そのもの)
- 7. Security Step 2(見直し演習で再登場。新しい発見が無くてもOK、定着確認が目的)

**トラブル対応**: トレーニーがJSONの構文を壊した場合、`exercises/harness-settings/step2-after.json` をそのまま `cp` させれば復旧できる。

---

## 仕掛け3: hookログのactorフィールドが固定値(Log Engineeringの仕込み)

**場所**: `samples/common-web/.claude/hooks/log-hook.js` 内、`actor: "agent"` の部分(ハードコード)

**何が問題か**: 5. Log Engineering で構造化したログは `request_id`(`tool_use_id`、本物の相関ID)や `duration_ms` は取れるようになるが、`actor` フィールドは常に固定文字列 `"agent"` になる。**Claude Codeのhookには、操作した人間のユーザー名やアカウント情報は一切渡されない**ため、「本当に誰が操作したか」はこの仕組みだけでは絶対に分からない。

**使うセクション**:
- 5. Log Engineering Step 1(hookを書く過程で `actor: 'agent'` が固定値であることに気づかせる。問いかけ例は `materials/05-log-engineering.md` Step 1末尾を参照)
- 7. Security Step 1(`/security-review` で再度指摘させる。または誘導質問で拾う)

**確認コマンド(講師が事前に動作確認する時用)**:
```bash
cd samples/common-web
cp exercises/log-settings/after.json .claude/settings.json
# Claude Codeでファイルを1つ編集させた後
cat .claude/harness.log
# 期待: {"timestamp":"...","request_id":"<tool_use_idの値>","actor":"agent","action":"Edit",...}
# → actorが常に"agent"固定であることを目視確認
```

**見つからなかった場合に読み上げる誘導質問**: 「このログの`actor`フィールド、複数人で同じPC/同じ設定を使い回したら、誰が操作したか区別できる?」

---

## 仕掛け4(旧): server.jsのリクエストログ拡張 — 廃止

~~`server.js` のミドルウェア(method/pathのみ)を発展課題として拡張させる~~ → **2026-10-04付で廃止**。Log Engineeringセクションをアプリソース非改変・hook設定のみの方針に変更したため、`server.js` は今後一切編集対象にしない。

**代わりの発展課題**: `PreToolUse` hookを追加し、`tool_use_id` をキーに開始時刻を一時ファイルへ控え、`PostToolUse` 側で読み出して本当の処理時間を取る(近似値ではない正確な`duration_ms`)。詳細は `materials/05-log-engineering.md` の「発展課題」セクションを参照。これも `.claude/settings.json` の追記のみで完結し、アプリのソースは触らない。

---

## 全体の進行上の注意

- 仕掛けは「見つけさせる」ためのものなので、口頭で先に言わない
- Security セクションで `/security-review` を実行させた際、上記 仕掛け1・3 が指摘候補として挙がるはず(仕掛け2はトレーニー自身がStep2で既に直しているので、/security-reviewでは通常再検出されない)
- 挙がらなかった場合は各仕掛けの「誘導質問」で拾わせる
- `samples/common-web/exercises/` 配下のファイルは講師・トレーニー双方が使う「正解/参照ファイル」。中身を変更する場合は `ClaudeTraining/samples/common-web/exercises/` 側を編集し、`scripts/publish-samples.sh` で `minitask-handson` へ同期すること(直接 `minitask-handson` を編集しない)
