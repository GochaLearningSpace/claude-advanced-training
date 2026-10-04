# Graph Engineering

## 一言で
複数エージェントの処理は必ずDAG(有向非巡回グラフ)になる。設計判断は「どこにバリア(全員待ち合わせ)を置くか」に集約される。バリアは要る時だけ使う。

## barrier版(全員待ち合わせ)
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
→ Review が全部終わるまで Verify が1件も始まらない。

## pipeline版(バリア無し)
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
→ 1ファイル目がVerifyに進んでいる間に別のファイルがまだReview中、という進み方になる。

**なぜpipelineが速い?** ステージ間にバリアが無く、遅い1件が全体を止めないから。

## 可視化
「今書いたpipeline版の構造をmermaidで図にして」と頼むと、コードからDAGを起こせる。グラフ設計はコードの形そのもの。

## Claude Coworkとの対比
Claude Coworkの **multi-agent orchestration**(Claude calling Claude)は、複雑なタスクを渡すとサブエージェントを自動でspin upして並行処理する。

**じゃあGraph Engineeringを学ぶ意味は?** → 自動生成されたグラフが最適とは限らない。どこにバリアを置くべきか、どこを並列化すべきかを見抜く目が無いと、Coworkが作ったgraphが非効率でも気づけない。

## よくある質問
- **Q. いつbarrierを使うべき?** → 次のステージが「全員の結果を一度に見る」必要がある時(例: 全findingsを重複排除してから検証する)。そうでなければpipelineがデフォルト。
