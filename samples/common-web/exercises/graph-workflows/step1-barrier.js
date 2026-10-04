// 6. Graph Engineering Step 1(バリアあり版)
// Workflowツールに渡して実行する。Reviewが4件全部終わるまでVerifyは1件も始まらない。
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
