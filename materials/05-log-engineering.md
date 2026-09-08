# 5. Log Engineering(15分・ハンズオン)

対象: `samples/common-web`(MiniTask)。2. Harness Engineering で作った `.claude/harness.log` と、`routes/tasks.js` の DELETE ログを構造化する。

## 原則(3分で話す)

エージェント実行・アプリの両方に共通する構造化ログの設計原則:
- 1エントリ = 1オブジェクト(JSON Lines形式)
- 最低限持たせるフィールド: `timestamp` / `request_id`(相関ID) / `actor`(誰が) / `action`(何をした) / `status` / `duration_ms`
- エージェント文脈ではさらに: `tool_name` / `token数` / `cost`

「ログが無いと、後から何が起きたか再現できない」を強調。

## 手順

### Step 1: DELETE 操作のログを構造化する(7分)

`routes/tasks.js` の現状:

```js
console.log(`[ADMIN] task deleted: id=${removed.id} title="${removed.title}"`);
```

これを、相関IDと呼び出し元情報を持った構造化ログに書き換えさせる:

```js
const requestId = crypto.randomUUID();
const startedAt = Date.now();
// ...削除処理...
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  request_id: requestId,
  actor: req.header("x-admin-key") ? "admin" : "unknown",
  action: "task.delete",
  target_id: removed.id,
  status: "success",
  duration_ms: Date.now() - startedAt,
}));
```

(`crypto` は Node 標準モジュール、`require("crypto")` を先頭に追加させる)

書けたら実際に DELETE を叩かせて(curl か MiniTask に削除ボタンを足す余裕があれば UI から)、ログが JSON 1行で出ることを確認。

**問いかけ**: 「`actor` が `"admin"` にしかならない今の実装、本当に『誰が』削除したか分かる? どう直せば良い?」→ 議論(実装まではしない)

### Step 2: エージェント実行ログの観察(5分)

Workflow ツールを使ったことがあるトレーニーに、実行後の `journal.jsonl` を見せてもらう(無ければ講師が画面共有)。

問いかけ: 「なぜこのログがあると、途中から再開(resume)できるのか?」→ 「各 `agent()` 呼び出しの入力と結果がペアで記録されているから、同じ入力ならキャッシュを返せる」という結論に導く。

Step 1 で書いた構造化ログと同じ発想(相関ID + 入出力の記録)であることを明示的に繋げる。

## 講師メモ
- Step 1 は `crypto.randomUUID()` が Node 14.17+ で使える前提。トレーニーの Node バージョンを事前確認しておく
- Step 2 で Workflow 未使用のトレーニーが多い場合、講師の journal.jsonl を見せるだけで進める
