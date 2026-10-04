# 5. Log Engineering(15分・ハンズオン)

対象: `samples/common-web`(MiniTask)。2. Harness Engineering で `.claude/settings.json` に設定した PostToolUse hook を、構造化ログを吐く設定に進化させる。

トレーニーに「実際に試したい」と言われたら `harness-graph-demo` skill がファイル切替・ログ確認まで代行してくれる(概念説明は `training-concepts` skill、実行は `harness-graph-demo` skill)。

**2.との繋がり**: 2.で「動くハーネス」を作ったが、そのhookが吐くログはただの生ログ(`タイムスタンプ テキスト`)だった。ここでは**アプリのソースコードは一切触らず、Claude Code自身の設定(hookのコマンド)だけ**を変更して、構造化ログに育てる。「Log EngineeringはClaude Codeの設定で実現できる」ことを体感するのが目的。

## 原則(3分で話す)

エージェント実行・アプリの両方に共通する構造化ログの設計原則:
- 1エントリ = 1オブジェクト(JSON Lines形式)
- 最低限持たせるフィールド: `timestamp` / `request_id`(相関ID) / `actor`(誰が) / `action`(何をした) / `status` / `duration_ms`

「ログが無いと、後から何が起きたか再現できない」を強調。

## 手順

### Step 1: hookのコマンドを構造化ログに書き換える(8分)

2.で設定した hook(`.claude/settings.json` の `PostToolUse`)は、現状こう吐いている:

```
2026-10-04T12:00:00.000Z Edit routes/tasks.js
```

**トレーニーに問う**: 「このログから、何が足りない?」→ 議論(1分)。期待する答え:
- 相関ID(`request_id`)が無い → 複数の編集が並んだ時、どれがどれか分からない
- `duration_ms` が無い → エージェントの動作が遅いのか速いのか分からない

**Claude Codeが実際にhookへ渡してくるJSON**(公式ドキュメント確認済み: `session_id` / `tool_use_id` / `tool_name` / `tool_input` 等)には、ツール呼び出しごとに一意な `tool_use_id` が含まれている。これを `request_id` として使えば、自前で `crypto.randomUUID()` する必要すらない。

一方、`timestamp` や `duration_ms` はClaude Codeからは渡されない(hookは「ツール呼び出しが終わった後」に1回呼ばれるだけで、開始時刻は分からない)。**無いものは自分で作る**: 直前のログ行のタイムスタンプとの差分を取れば、「前のツール呼び出しからどれだけ間が空いたか」という近似の `duration_ms` が得られる。

**設計方針**: 2.と同じ理由で、ロジックは `.claude/hooks/log-hook.js`(リポジトリに既に入っている普通の.jsファイル)に書いてあり、`settings.json` からは `node .claude/hooks/log-hook.js` と呼ぶだけ。長いコマンドをJSONに埋め込まない。

中身(読めば分かる):
```js
const fs = require("fs");
const LOG_FILE = ".claude/harness.log";
let input = "";
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    let previousTimestamp = null;
    try {
      const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n");
      const lastLine = lines[lines.length - 1];
      if (lastLine) previousTimestamp = JSON.parse(lastLine).timestamp;
    } catch (e) {}
    const now = new Date();
    const entry = {
      timestamp: now.toISOString(),
      request_id: payload.tool_use_id,
      actor: "agent",
      action: payload.tool_name,
      target: (payload.tool_input && payload.tool_input.file_path) || null,
      status: "success",
      duration_ms: previousTimestamp ? now - new Date(previousTimestamp) : null,
    };
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch (e) {}
});
```

hookのコマンドを以下に書き換えさせる(`.claude/settings.json` の `hooks.PostToolUse[0].hooks[0].command` を差し替えるだけ。`routes/tasks.js` 等アプリ側のコードは一切触らない):

```json
{
  "type": "command",
  "command": "node .claude/hooks/log-hook.js"
}
```

**Before/Afterをすぐ切り替えたい場合**(JSONはコメントで切替できないためファイルごと差し替え。動作確認済み: 2026-10-04):
```bash
# BEFORE(2.の生ログのまま)
cp exercises/log-settings/before.json .claude/settings.json

# AFTER(構造化ログ、完成形)
cp exercises/log-settings/after.json .claude/settings.json
```

書けたら実際に MiniTask のファイルを2つ連続で編集させ、`cat .claude/harness.log` で以下を確認させる:
- 1件目は `duration_ms: null`(直前のログが無いので差分が取れない)
- 2件目以降は `duration_ms` に実際の間隔(ミリ秒)が入る
- `request_id` が呼び出しごとに異なる(`tool_use_id` なので、自前でUUIDを生成していないのに一意)

**問いかけ**: 「`duration_ms` は本当に『このツール呼び出しにかかった時間』と言えるか?」→ 議論に誘導(実際は「前のログからの経過時間」であり、ツール自体の処理時間ではない。本当の処理時間が欲しければ `PreToolUse` でも記録して開始時刻を控えておく必要がある → 発展課題へ)

### Step 2: エージェント実行ログの観察(5分)

Workflow ツールを使ったことがあるトレーニーに、実行後の `journal.jsonl` を見せてもらう(無ければ講師が画面共有)。

問いかけ: 「なぜこのログがあると、途中から再開(resume)できるのか?」→ 「各 `agent()` 呼び出しの入力と結果がペアで記録されているから、同じ入力ならキャッシュを返せる」という結論に導く。

Step 1 で書いた構造化ログと同じ発想(相関ID + 入出力の記録)であることを明示的に繋げる。

### 発展課題(時間が余ったら・本編15分には含まない)

Step 1 の `duration_ms` は「前のログからの経過時間」の近似値でしかない。本当の「このツール呼び出し自体にかかった時間」を取りたい場合は、`PreToolUse` hookも追加して開始時刻を一時ファイルに控え、`PostToolUse` 側で `tool_use_id` をキーに読み出して差分を取る、という設計になる(2つのhookイベントを `tool_use_id` で紐付ける、という相関IDの本来の使い方)。

早く終わったトレーニーへの追加課題として、`PreToolUse` を `.claude/settings.json` に足して実装させてみる(**全員必須の演習ではない**)。

## 講師メモ
- Step 1 は `duration_ms` が1件目は必ず`null`になる(直前ログが無いため)。トレーニーが「バグでは?」と聞いてきたら、むしろ「直前データが無い時にどう振る舞うか」を設計する良い実例として扱う
- Step 2 で Workflow 未使用のトレーニーが多い場合、講師の journal.jsonl を見せるだけで進める
