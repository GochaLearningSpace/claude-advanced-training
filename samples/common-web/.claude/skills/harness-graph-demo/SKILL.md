---
name: harness-graph-demo
description: Use when a trainee wants to actually run the Harness Engineering (hook on/off, permission scope before/after, harness.log), Log Engineering (structured log before/after), or Graph Engineering (barrier vs pipeline workflow) demos themselves, not just hear them explained — triggers include "デモやって", "実際に試したい", "before/afterを切り替えて", "barrier版とpipeline版動かして", "harness.log見せて", "構造化ログにして", "ハンズオンで動かして".
---

# Harness / Log / Graph Engineering デモ実行

## 一言で
`training-concepts` スキルは概念の**説明**専用。このスキルは実際に**ファイル切替・ログ確認・workflow実行**までやる実行系。両方読んだ上で、説明は training-concepts、実行はこちらに任せる。

## 対応デモ一覧

| 呼ばれ方の例 | やること |
|---|---|
| step1 before / hookなし | `.claude/settings.json` を hookなし状態に |
| step1 after / hookあり | hookあり状態に切替 |
| step2 before / 過剰権限 | 過剰権限設定に切替 |
| step2 after / 最小権限 | 最小権限設定に切替 |
| harness.log 見せて | `.claude/harness.log` を表示 |
| ログを構造化して / log after | 構造化ログ(`log-hook.js`)に切替 |
| ログを生ログに戻して / log before | 生ログ(`harness-hook.js`)に戻す |
| barrier版動かして | barrier(全員待ち合わせ)版 workflow を実行 |
| pipeline版動かして | pipeline(バリア無し)版 workflow を実行 |
| 元に戻して | `.claude/settings.json` をリポジトリの既定状態に戻す |

## 実行手順

### settings.json の切替(step1/step2 before・after)
対応する `exercises/harness-settings/*.json` を `.claude/settings.json` にコピーする。コピー前に現在の中身を一言要約してから切替える(何が変わるか言ってから変える)。

```bash
cp exercises/harness-settings/step1-before.json .claude/settings.json   # hookなし
cp exercises/harness-settings/step1-after.json  .claude/settings.json   # hookあり(=このリポジトリの既定)
cp exercises/harness-settings/step2-before.json .claude/settings.json   # 過剰権限 Bash(*) 等
cp exercises/harness-settings/step2-after.json  .claude/settings.json   # 最小権限 npm run/git/Edit(samples/common-web/**) のみ
```

after系(hookあり)に切り替えたら、動作確認として適当な1行コメントをどこかのファイルに追記し、harness.log を見るところまで続けてやる。before系(過剰権限)に切り替えた場合は「今これが許可されている」と具体的なコマンド例(`Bash(*)` なら任意コマンド実行)を1つ挙げて見せる。

### harness.log 確認
```bash
cat .claude/harness.log
```
hookなし状態(step1-before)だと空 or 記録が増えない。これは不具合ではなく正しい挙動なのでその旨を伝える。

### ログを構造化する(5. Log Engineering: log before/after)
`.claude/hooks/harness-hook.js`(生ログ)と `.claude/hooks/log-hook.js`(構造化ログ)を切り替える。ロジックは実ファイルなので `settings.json` 自体は1行(`command`)しか変わらない。

```bash
cp exercises/log-settings/before.json .claude/settings.json   # 生ログ(harness-hook.js を呼ぶ)
cp exercises/log-settings/after.json  .claude/settings.json   # 構造化ログ(log-hook.js を呼ぶ)
```

after切替後、ファイルを2つ連続で編集させてから `cat .claude/harness.log` を見せる。1件目は `duration_ms: null`、2件目以降は実際の間隔が入ることを指摘する。`request_id` が `tool_use_id`(Claude Code自身が渡す値)であり自前UUID不要な点にも触れる。

### graph-barrier(barrier版 workflow)
Workflow ツールに次のスクリプトをそのまま渡して実行する。ユーザーに「複数エージェントが実際に動く」ことを一言断ってから実行する。

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

### graph-pipeline(pipeline版 workflow)
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

実行後、/workflows の進捗表示を見ながら「barrier版はReviewが4件全部終わるまでVerifyが1件も始まらない」「pipeline版は早く終わったファイルから先にVerifyへ進む」という違いを指摘する。両方試した場合は体感速度差にも触れる。

(同じ内容が `exercises/graph-workflows/step1-barrier.js` / `step2-pipeline.js` にファイルとしても置いてある。実行はコピペで十分だが、トレーニーが後で見返す用の参照ファイルとして案内してもよい)

### 元に戻す
このリポジトリの `.claude/settings.json` の既定状態は `exercises/harness-settings/step1-after.json` と同一(hookあり・権限制限なし)。デモ後は必ずこれに戻す。

```bash
cp exercises/harness-settings/step1-after.json .claude/settings.json
```

## 注意
- settings.json の切替はファイル実体を上書きする。`.claude/` はこのリポジトリでgit未管理(`git status` で `??` 表示)なので `git checkout --` では戻せない。必ず上記の明示コピーで戻す。
- デモ終了後、切り替えっぱなしにしない。特に step2-before(過剰権限)のまま放置しない。ログ構造化もbefore(生ログ)に戻しておく。
- Workflowデモは実際にエージェントを複数起動する(トークン消費あり)。実行前に一言断る。
- 概念の説明はしない・混ぜない。「なぜbarrierが遅いか」等の解説が要る場合は training-concepts の graph-engineering.md を参照するよう促す。
- `.claude/hooks/harness-hook.js` と `.claude/hooks/log-hook.js` は削除しない。`settings.json` の `command` はこの2ファイルを呼ぶだけなので、無くすとhookが動かなくなる。
