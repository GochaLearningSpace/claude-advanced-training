# 6. Graph Engineering(15分・ハンズオン)

対象: `samples/common-web`(MiniTask)の4ファイルをレビュー対象に、Workflow ツールで pipeline と parallel(バリア)の違いを体感する。

## 概念(3分で話す)

複数エージェントの処理は必ず DAG(有向非巡回グラフ)になる。設計判断は「どこにバリア(全員待ち合わせ)を置くか」に集約される。バリアは要る時だけ使う、が原則。

## 手順

### Step 1: バリアあり版を書いて実行(3分)

対象ファイル: `server.js` / `routes/tasks.js` / `lib/store.js` / `public/app.js`

```js
export const meta = {
  name: 'review-barrier',
  description: 'MiniTaskの4ファイルをレビューしてから検証する(バリアあり版)',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}
const FILES = ['server.js', 'routes/tasks.js', 'lib/store.js', 'public/app.js']
phase('Review')
const reviews = await parallel(FILES.map(f => () =>
  agent(`samples/common-web/${f} をレビューし、気になる点を1つ挙げて`, { label: `review:${f}` })
))
phase('Verify')
const verified = await parallel(reviews.map((r, i) => () =>
  agent(`次の指摘は妥当か検証して: ${r}`, { label: `verify:${FILES[i]}` })
))
return verified
```

実行させて、Review が全部終わるまで Verify が1件も始まらないことを進捗表示で確認させる。

### Step 2: pipeline 版に書き換えて実行(3分)

```js
export const meta = {
  name: 'review-pipeline',
  description: 'MiniTaskの4ファイルをレビューしてから検証する(pipeline版)',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}
const FILES = ['server.js', 'routes/tasks.js', 'lib/store.js', 'public/app.js']
const results = await pipeline(
  FILES,
  f => agent(`samples/common-web/${f} をレビューし、気になる点を1つ挙げて`, { phase: 'Review', label: `review:${f}` }),
  (r, f) => agent(`次の指摘は妥当か検証して: ${r}`, { phase: 'Verify', label: `verify:${f}` })
)
return results
```

実行させて、1ファイル目が Verify に進んでいる間に別のファイルがまだ Review 中、という進捗になることを確認させる。

**問いかけ**: 「同じ結果を得るのに、どちらが速く終わった? なぜ?」→ pipeline はステージ間にバリアが無く、遅い1件が全体を止めないから、という結論に導く。

### Step 3: mermaid で可視化(3分)

トレーニーに「今書いた pipeline 版の構造を mermaid で図にして」と Claude Code に指示させる。DAG として手で描かせるのではなく、書いたコードから図を起こさせることで「グラフ設計はコードの形そのもの」だと体感させる。

### Step 4: Claude Cowork との対比(3分・ディスカッション)

Claude Cowork の **multi-agent orchestration(Claude calling Claude)** を紹介: 複雑なタスクを渡すと、Cowork が自動的にサブエージェントを spin up して並行処理する。

問いかけ: 「今 Step 1・2 で手で設計した graph 構造(review → verify のDAG)は、Cowork なら自動生成される。じゃあ Graph Engineering を学ぶ意味は何?」

→ 結論に誘導: 「自動生成されたグラフが最適とは限らない。どこにバリアがあるべきか、どこを並列化すべきかを見抜く目がないと、Cowork が作った graph が非効率でも気づけない」

## 講師メモ
- Step 1・2 は実際の agent() 呼び出しなので数十秒〜数分かかる。教室の回線・API 負荷状況によっては時間超過リスクあり。バックアップとして講師の実行結果のスクリーンショット/ログを用意しておく
- トレーニーごとに実行タイミングがバラつく前提で、進んだトレーニーには Step 3 を先にやらせて時間調整する
