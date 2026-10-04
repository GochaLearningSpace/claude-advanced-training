# 2. Harness Engineering(20分・ハンズオン)

対象: `samples/common-web`(MiniTask)を各自の Claude Code で操作。

トレーニーに「実際に試したい」と言われたら `harness-graph-demo` skill がファイル切替・ログ確認まで代行してくれる(概念説明は `training-concepts` skill、実行は `harness-graph-demo` skill)。

## 定義(1分で話す)
ハーネス = エージェントループ + 権限システム + ツール定義 + フィードバックループの総体。今日は「動くハーネス」を実際に手で組み立てて体感する。

**この後との繋がり**: ここで作る `harness.log` は生ログのまま。5. Log Engineering でこれを「後から再現できる」構造化ログに育てる。6. Graph Engineering は「1エージェントの土台(ここ)」の先にある「複数エージェントの構造設計」の話。

## 手順

### Step 1: hook でエージェント行動を可視化する(7分)

**設計方針**: hookの実行コマンドをJSONの中に長い1行で埋め込むと、シェル(bash/PowerShell/cmd)ごとにクォートの扱いが違って壊れやすい。なので実行コマンド本体は普通の `.js` ファイルに書き、`settings.json` からは `node <ファイル>` と呼ぶだけにする。これで環境差によるトラブルがほぼ無くなる。

**やること**

1. `samples/common-web/.claude/hooks/harness-hook.js` を開いて中身を見せる(既にリポジトリに入っている、読めば何をしているか分かる普通のコード):

```js
// stdinからJSONを受け取り、1行の生ログとして .claude/harness.log に追記する
const fs = require("fs");
let input = "";
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    const filePath = (payload.tool_input && payload.tool_input.file_path) || "";
    const line = `${new Date().toISOString()} ${payload.tool_name} ${filePath}`;
    fs.appendFileSync(".claude/harness.log", line + "\n");
  } catch (e) {}
});
```

2. `.claude/settings.json` を作って、このスクリプトを呼ぶ設定を入れる:

```bash
cp exercises/harness-settings/step1-after.json .claude/settings.json
```

(中身は以下。手で書く場合もこれをそのままコピペすればよい)
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/harness-hook.js" }
        ]
      }
    ]
  }
}
```

(`matcher` に `Bash` も含めてある。Claude Codeがファイル編集を素の `Edit`/`Write` ツールでなく `Bash`(`echo`/`sed`等)で実行することがあるため、両方拾えるようにしてある)

3. Claude Code に戻り、MiniTaskの適当なファイルを1つ編集させる(「`server.js` に空行を1行足して」など、内容は何でもよい。Editツールを使うかBashを使うかはClaude Code任せでよい)
4. ターミナルで `cat .claude/harness.log` を実行する

**✅ 確認(これが出たら成功)**: `cat .claude/harness.log` の出力に、`2026-10-04T... Edit server.js`(または `... Bash `)のような1行が追加されている。これが「エージェントが何をしたかの記録」。

**Before/After をすぐ切り替えたい場合(JSONはファイル内コメントで切替できないため、ファイルごと差し替える)**:
```bash
# BEFORE(hookなし)に戻す
cp exercises/harness-settings/step1-before.json .claude/settings.json

# AFTER(hookあり、完成形)に進める
cp exercises/harness-settings/step1-after.json .claude/settings.json
```

**この時点でのログはただの生ログ。5. Log Engineering セクションでこれを構造化フィールドへ拡張する** — 伏線として明示する。

### Step 2: 権限スコープを書いて、壊して、直す(6分)

**やること①(わざと壊す)**

1. 同じ `.claude/settings.json` に、以下を追記させる(Step 1 の `hooks` はそのまま残す)

```json
{
  "permissions": {
    "allow": ["Bash(*)", "WebFetch(*)", "Write(*)"]
  }
}
```

**問いかけ**: 「このエージェントに今、何ができてしまうか?」→ 議論(1分)。(答え: 任意コマンド実行+任意ファイル書き込み+外部通信、全部できてしまう)

**やること②(絞り込んで直す)**

2. 上記を、以下に書き換えさせる(MiniTaskの開発で実際に必要な操作だけ)

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git *)", "Edit(samples/common-web/**)"]
  }
}
```

**✅ 確認(これが出たら成功)**: 設定を保存した後、MiniTask以外のファイルを編集しようとすると、Claude Codeが許可を求めてくる(=できなくなっている)。「npmコマンド」「gitコマンド」「MiniTaskファイルの編集」だけはそのまま通る。

**ポイント**: 「最小権限」は抽象論ではなく、実際に許可リストを削る作業そのものだと体感させる。

**Before/After をすぐ切り替えたい場合**:
```bash
# BEFORE(過剰な権限、hookは維持)
cp exercises/harness-settings/step2-before.json .claude/settings.json

# AFTER(最小権限、hookは維持)
cp exercises/harness-settings/step2-after.json .claude/settings.json
```

### Step 3: Claude Cowork との対比(7分・ディスカッション)

手を動かす演習はここまで。ここからは画面操作なし、話を聞くだけのパート。

Claude Cowork の設計原理を紹介:
- **outcomes**: 手順でなくゴールを指定する制御方式
- **webhooks**: 外部システムからのトリガーでエージェントが起動する仕組み

問いかけ: 「Step 1 で書いた hook はステップ指定型の制御。もし MiniTask のタスク追加を『ゴール指定型』で書くとしたら、どう変わる?」「タスク追加を外部トリガー(Slack通知など)で起動するなら、webhooks的に何を仕込む?」

→ 実装はしない。ハーネス設計に「ステップ指定 ⇔ ゴール指定」というスペクトラムがあることを伝えるのが目的。

## 講師メモ
- Step 1 は `exercises/harness-settings/` 配下の完成ファイルを `cp` させるのが最速・最安定。手打ちさせる場合はPowerShellの `Set-Content -Encoding utf8` がBOMを付与してJSONを壊す既知の問題があるので要注意(`-Encoding ascii` を使わせる)
- Step 2 は「壊してから直す」体験が肝。先に正解を見せない
- 初心者トレーニーには「JSONの中身は今は分からなくていい。コピペして保存→確認、の繰り返しだけでOK」と最初に一言添えると不安が減る
