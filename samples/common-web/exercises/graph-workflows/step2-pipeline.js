// 6. Graph Engineering Step 2(pipeline版)
// Workflowツールに渡して実行する。早く終わったファイルから先にVerifyへ進む(バリア無し)。
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
