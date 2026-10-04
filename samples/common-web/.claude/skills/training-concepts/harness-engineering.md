# Harness Engineering

## 一言で
ハーネス = **エージェントループ + 権限システム + ツール定義 + フィードバックループ** の総体。「エージェントをどう動かすか」の設計そのもの。

## 3つの柱

### 1. hookで行動を可視化する
エージェントがファイルを編集するたびに、その記録を残す仕組み。`.claude/settings.json` にPostToolUse hookを書く:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/harness-hook.js"
          }
        ]
      }
    ]
  }
}
```

**試してみる**: 上記を `.claude/settings.json` に保存 → 適当なファイルを編集 → `cat .claude/harness.log` で記録を確認。このログは5. Log Engineeringで構造化ログに発展させる話につながる。

**Before/Afterをすぐ切り替えたい場合**(JSONはコメントで切替できないためファイルごと差し替え): `cp exercises/harness-settings/step1-before.json .claude/settings.json`(hookなし) / `cp exercises/harness-settings/step1-after.json .claude/settings.json`(hookあり)

### 2. 権限スコープ(最小権限)
まず壊す(過剰権限):
```json
{ "permissions": { "allow": ["Bash(*)", "WebFetch(*)", "Write(*)"] } }
```
→ 問い: 「このエージェントに今、何ができてしまうか?」(任意コマンド実行+任意ファイル書き込み+外部送信が全部できる)

次に絞る(実際に必要な範囲だけ):
```json
{ "permissions": { "allow": ["Bash(npm run *)", "Bash(git *)", "Edit(samples/common-web/**)"] } }
```
「最小権限」は抽象論ではなく、実際に許可リストを削る作業そのもの。

**Before/Afterをすぐ切り替えたい場合**: `cp exercises/harness-settings/step2-before.json .claude/settings.json`(過剰権限) / `cp exercises/harness-settings/step2-after.json .claude/settings.json`(最小権限)

### 3. 検証ループ(フィードバック)
ハーネスに検証機構が無いと、エージェントが出した結果の間違いに誰も気づけない。例: チャートのシリーズがずれるようなバグ。「MiniTaskに検証ステップを足すなら何を確認する?」→ タスク追加後にAPIレスポンスの型を検査する、等。

## Claude Coworkとの対比
- **outcomes**: 手順でなくゴールを指定する制御方式(「タスクを追加して」ではなく「未完了タスクが0件になるまで」)
- **webhooks**: 外部システムからのトリガーでエージェントが起動する仕組み

今書いたhookは「ステップ指定型」の制御。「ステップ指定 ⇔ ゴール指定」はスペクトラムであり、どちらが適切かはタスク次第。

## よくある質問
- **Q. hookとpermissionsの違いは?** → hookは「何が起きたか記録する」、permissionsは「何をしてよいか制限する」。両方揃って初めて「観測できて、かつ制御できる」ハーネスになる。
- **Q. 権限を絞りすぎて動かなくなったら?** → エラーメッセージに出る拒否された操作を見て、1つずつ許可リストに足す。最初から広く許可するより安全。
