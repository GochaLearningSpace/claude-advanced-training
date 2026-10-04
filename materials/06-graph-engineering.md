# 6. Graph Engineering(15分・ハンズオン)

対象: `samples/common-web`(MiniTask)の4ファイルをレビュー対象に、Workflow ツールで pipeline と parallel(バリア)の違いを体感する。

**実行コードの置き場所**: Step 1・2 のスクリプトは `samples/common-web/exercises/graph-workflows/step1-barrier.js` / `step2-pipeline.js` にも同じ内容を保存済み(他セクションのbefore/after参照ファイルと同じ位置づけ)。トレーニーに「実際に試したい」と言われたら `harness-graph-demo` skill がファイル切替・workflow実行まで代行してくれる(概念説明は `training-concepts` skill、実行は `harness-graph-demo` skill、で役割分担されている)。

## 概念(3分で話す)

複数エージェントの処理は必ず DAG(Directed Acyclic Graph：有向非巡回グラフ)になる。
有向非巡回グラフ（DAG: Directed Acyclic Graph）とは、向き（矢印）があり、周回（ループや閉路）がない グラフ構造のこと。

https://ja.wikipedia.org/wiki/%E6%9C%89%E5%90%91%E9%9D%9E%E5%B7%A1%E5%9B%9E%E3%82%B0%E3%83%A9%E3%83%95

**噛み砕くと3つの単語の意味**:
- **Directed(有向)**: 矢印に向きがある → 「AをやってからB」という順序がある
- **Acyclic(非巡回)**: ぐるぐる回る矢印(閉路)が無い → 永遠にループしない
- **Graph(グラフ)**: 箱(処理)と矢印(依存関係)の集まり

**身近な例**: 洗濯の手順 — 洗う → 絞る → 干す(逆戻りしない、必ずこの順番。「干す→洗う」には戻れない=非巡回)

**今日の演習での実例**: `review:server.js → verify:server.js` のような「review後にverify」という矢印が4ファイル分ある。矢印の向きは固定(verifyからreviewには絶対戻らない)。これが今日扱うDAGの正体。

設計判断は「どこにバリア(全員待ち合わせ)を置くか」に集約される。バリアは要る時だけ使う、が原則。

**ここまでとの繋がり**: 2. Harness Engineeringは「1エージェントの土台」、5. Log Engineeringは「その記録の構造化」だった。Graph Engineeringはその先、「複数エージェントをどう構造化して動かすか」の話。実行ログ(`journal.jsonl`)が読めるのも、5.で扱った構造化ログ(相関ID+入出力の記録)と同じ発想だから。

## 手順

### Step 1: バリアあり版を書いて実行(3分)

**やること**

1. Claude Codeで `Workflow` ツールを使い、以下のスクリプトをそのまま実行させる(内容を理解する必要はまだ無い。「全員のReviewが終わってからVerifyが始まる」構造だとだけ伝える)

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

**✅ 確認(これが出たら成功)**: 実行中の進捗表示を見る。「Review」のグループが4件とも完了マークが付くまで、「Verify」のグループは1件も始まらない(グレーアウト/未着手のまま)。これが「バリア」の実物。

### Step 2: pipeline 版に書き換えて実行(3分)

**やること**

1. 同じスクリプトを、以下に書き換えて実行させる(`parallel`→`pipeline`に変わっただけ、という点を強調)

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

**✅ 確認(これが出たら成功)**: 進捗表示を見る。1ファイル目が「Verify」に進んでいるのに、別のファイルはまだ「Review」中、という「追い越し」が起きている(Step 1 のようにきれいに2段階で揃わない)。

**問いかけ**: 「同じ結果を得るのに、どちらが速く終わった? なぜ?」→ pipeline はステージ間にバリアが無く、遅い1件が全体を止めないから、という結論に導く。

### Step 3: mermaid で可視化(3分)

**やること**

1. トレーニーに「今書いた pipeline 版の構造を mermaid で図にして」と Claude Code に指示させる

**✅ 確認(これが出たら成功)**: チャット内に図(箱と矢印)が表示される。DAGとして手で描かせるのではなく、書いたコードから図を起こさせることで「グラフ設計はコードの形そのもの」だと体感させるのが狙い。

### Step 4: Claude Cowork との対比(3分・ディスカッション)

手を動かす演習はここまで。ここからは話を聞くだけのパート。

Claude Cowork の **multi-agent orchestration(Claude calling Claude)** を紹介: 複雑なタスクを渡すと、Cowork が自動的にサブエージェントを spin up して並行処理する。

問いかけ: 「今 Step 1・2 で手で設計した graph 構造(review → verify のDAG)は、Cowork なら自動生成される。じゃあ Graph Engineering を学ぶ意味は何?」

→ 結論に誘導: 「自動生成されたグラフが最適とは限らない。どこにバリアがあるべきか、どこを並列化すべきかを見抜く目がないと、Cowork が作った graph が非効率でも気づけない」

## 講師メモ
- Step 1・2 は実際の agent() 呼び出しなので数十秒〜数分かかる。教室の回線・API 負荷状況によっては時間超過リスクあり。バックアップとして講師の実行結果のスクリーンショット/ログを用意しておく
- トレーニーごとに実行タイミングがバラつく前提で、進んだトレーニーには Step 3 を先にやらせて時間調整する
- 初心者トレーニーには「コードの中身を今理解する必要はない。実行して、進捗表示の違いを目で見るだけでOK」と最初に一言添える
