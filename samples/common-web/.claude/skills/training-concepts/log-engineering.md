# Log Engineering

## 一言で
「ログが無いと、後から何が起きたか再現できない」。2. Harness Engineeringで設定したhookを、**アプリのソースコードは一切触らず、Claude Codeの設定(hookのコマンド)だけ**で構造化ログに進化させる。

## 原則
- 1エントリ = 1オブジェクト(JSON Lines形式、1行1JSON)
- 最低限持たせるフィールド: `timestamp` / `request_id`(相関ID) / `actor`(誰が) / `action`(何をした) / `status` / `duration_ms`

## このリポジトリでの実例
2.で設定したhookは今こう吐いている(生ログ):
```
2026-10-04T12:00:00.000Z Edit routes/tasks.js
```

Claude CodeがPostToolUse hookに渡すJSONには `tool_use_id`(ツール呼び出しごとに一意)が含まれている。これを `request_id` として使えば、自前でUUIDを生成する必要が無い。一方 `timestamp`/`duration_ms` はClaude Codeから渡されないので自分で作る(`duration_ms` は直前ログとの差分で近似)。

hookのコマンドを以下に差し替える(`.claude/settings.json` のみ変更、アプリのソースは触らない):
```json
{
  "type": "command",
  "command": "node .claude/hooks/log-hook.js"
}
```

**Before/Afterをすぐ切り替えたい場合**: `cp exercises/log-settings/before.json .claude/settings.json`(生ログ) / `cp exercises/log-settings/after.json .claude/settings.json`(構造化ログ、動作確認済み)

**試してみる**: ファイルを2つ連続で編集 → `cat .claude/harness.log`。1件目は `duration_ms: null`(直前ログが無い)、2件目以降は実際の間隔が入る。`request_id` は呼び出しごとに異なる値(`tool_use_id`)。

**気づくべき問題**: `duration_ms` は「前のログからの経過時間」の近似であって、「このツール呼び出し自体にかかった時間」ではない。本当の処理時間が欲しければ `PreToolUse` でも記録して開始時刻を控え、`tool_use_id` で紐付ける必要がある。

## エージェント実行ログ(journal.jsonl)との関係
Workflowツールの実行ログ `journal.jsonl` は、各 `agent()` 呼び出しの入力と結果がペアで記録されている。だから同じ入力なら再実行時にキャッシュを返せる(resume可能)。これは上記の構造化ログと同じ発想 = **相関ID + 入出力の記録**。

## 発展(余裕があれば)
`PreToolUse` hookを追加し、開始時刻を `tool_use_id` をキーにした一時ファイルへ控えておく。`PostToolUse` 側でそれを読み出せば、近似ではない本当の処理時間が取れる。2つのhookイベントを相関IDで紐付ける、という設計の実例。
