---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section { font-size: 26px; }
  section.lead h1 { font-size: 56px; }
  table { font-size: 20px; }
  code { font-size: 0.85em; }
---

<!-- _class: lead -->

# Claude アドバンストトレーニング
### 2時間 / ハンズオン中心

対象: skills / MCP を既に使っている人
サンプル: `samples/common-web`(MiniTask)
※ 資料は本日配布(事前配布なし)、冒頭でclone/セットアップします

---

## 全体アジェンダ(119分 + 予備1分)

**今回は事前配布なし → イントロでライブclone/セットアップ(15分)**

| # | セクション | 形式 | 時間 |
|---|-----------|------|------|
| 0 | イントロ+ライブセットアップ | 座学+作業 | 15分 |
| 1 | エコシステム比較 | 講師デモ | 7分 |
| 2 | Harness Engineering | ハンズオン | 20分 |
| 3 | Artifacts + Design | ハンズオン | 15分 |
| 4 | Self-host(ローカルLLM) | 講師デモ | 9分 |

---

## 全体アジェンダ(つづき)

| # | セクション | 形式 | 時間 |
|---|-----------|------|------|
| 5 | Log Engineering | ハンズオン | 15分 |
| 6 | Graph Engineering | ハンズオン | 15分 |
| 7 | Security | ハンズオン | 15分 |
| 8 | Claude Cowork | 説明+宿題 | 5分 |
| 9 | まとめ | 座学 | 3分 |

---

<!-- _class: lead -->

# 0. イントロ + ライブ環境セットアップ(15分)

---

## 今日のゴール

- ツールの使い方ではなく **「仕組み」「運用設計」「脅威モデル」**
- Harness Engineering / Self-host / Log Engineering / Graph Engineering / Security / Cowork / Artifacts & Design
- 座学は最小限、ほぼ手を動かす
- 今日やることは全部 **Claude Code の中で完結する**(後半のCodex/Antigravity/Coworkは視野拡張)

---

## 3つのEngineeringの地図

- **Harness Engineering(2.)**: エージェント1体の土台 — ループ+権限+観測(hook)+検証ループ
- **Log Engineering(5.)**: Harnessのhookが吐く生ログを、再現可能な構造化データに育てる
- **Graph Engineering(6.)**: 複数エージェントを動かすと、実行順序自体がグラフ(DAG)になる

**Harness(1体の土台) → Log(記録の構造化) → Graph(複数体の構造設計)**
Security(7.)はこの3つ全部に横断する脅威モデルの話として最後に回収

<!--
講師向け(トレーニーには見せない): 「Logが一番基本では?」と聞かれたら →
一般的な「ログ出力」の基本という意味ではLogが簡単に見える。だが今日のLog Engineeringは
「hookが吐くログを構造化する」話で、hook自体はHarness EngineeringのStep1で作る。
構造化する対象がまだ無い状態ではLogから教えられない。順番は技術的な依存関係であって、恣意的な並びではない。
-->

---

## 進め方

- 共通サンプル `samples/common-web`(MiniTask)を全員で操作
- GAS版 `samples/gas-backup` は予備(基本は共通サンプルで統一)
- Codex / Antigravity / ローカルLLM → **講師の手元のみ**(ライセンス・環境都合)
- 今すぐ: Claude Codeログイン確認 → `minitask-handson` を clone(このあとのスライドで手順)

---

## 今すぐセットアップ(10分)

```bash
git clone https://github.com/GochaLearningSpace/minitask-handson.git
cd minitask-handson/common-web
npm install
cp .env.example .env
npm start
```

`http://localhost:3000` を開いてタスク追加・チェックができればOK

- Git/clone不可 → GitHubの「Download ZIP」で代替
- `EADDRINUSE` → `.env` の `PORT` を変更
- 終わらなくても10分経ったら次へ進む(バックグラウンドで続行)

---

<!-- _class: lead -->

# 1. エコシステム比較(7分・講師デモ)

トレーニー操作なし

---

## 比較表(2026年10月時点で裏取り済み)

| 観点 | Claude Code | Codex(OpenAI) | Antigravity 2.0(Google) |
|------|------------|----------------|----------------------|
| 実行形態 | CLI/IDE拡張/SDK | CLI/クラウドサンドボックス | デスクトップアプリ+CLI |
| 権限 | settings.json スコープ | 3段階サンドボックス | プロジェクト単位 |
| 拡張性 | skills/hooks/MCP/Workflow | MCP + AGENTS.md | MCP + JSON hooks + `/schedule` |

**ポイント**: Antigravity 2.0でサブエージェント/hooks/CLIが追加 → 各社、同じ設計課題に収束しつつある

---

## 判断軸

- 拡張性・カスタムhook重視 → **Claude Code**
- コード実行の隔離性重視 → **Codex**
- ブラウザ操作込みのマルチタスク管理重視 → **Antigravity**

→ 次セクション以降は「ツール選びの話」ではなく「どのツールにも共通する仕組みの話」

---

<!-- _class: lead -->

# 2. Harness Engineering(20分・ハンズオン)

対象: `samples/common-web`

---

## ハーネス = エージェントループ + 権限 + ツール定義 + フィードバックループ

### Step 1: hookで行動を可視化(7分)
PostToolUse hookで Edit/Write の度に `.claude/harness.log` へ1行追記

```json
{ "hooks": { "PostToolUse": [{ "matcher": "Edit|Write|Bash",
  "hooks": [{ "type": "command", "command": "node -e \"...\"" }] }] } }
```
→ 動作確認済みコマンドは `materials/02-harness-engineering.md` 参照

---

### Step 2: 権限スコープを壊して直す(6分)

まず過剰権限を書かせる:
```json
{ "permissions": { "allow": ["Bash(*)", "WebFetch(*)", "Write(*)"] } }
```
問う: 「このエージェントに今、何ができてしまうか?」

→ 必要な操作だけに絞る:
```json
{ "permissions": { "allow": ["Bash(npm run *)", "Bash(git *)", "Edit(samples/common-web/**)"] } }
```

---

### Step 3

**Step 3(7分・ディスカッション)**: Claude Coworkの outcomes(ゴール指定)/ webhooks(外部トリガー)と対比
→ 「ステップ指定 ⇔ ゴール指定」のスペクトラムを伝える

---

<!-- _class: lead -->

# 3. Artifacts + Design(15分・ハンズオン)

Harness Engineeringとは独立枠

---

## お題

MiniTaskの `data/tasks.json` を使い、1枚のダッシュボードArtifactを作る:
- タスク総数・完了数・未完了数
- 進捗バー or ドーナツチャート
- タスク一覧(完了/未完了を視覚的に区別)

おさえるポイント: **配色の意図 / タイポの階層 / ライト・ダーク対応 / favicon**

---

## Before / After

`materials/assets/dashboard-before-edit.html` vs `dashboard-after-edit.html`

- **before**: ピンク単色、Inter決め打ち、絵文字装飾、全部中央揃え、ライト/ダーク非対応
- **after**: 「野帳」コンセプト、完了率を大きく、意味色、ライト/ダーク両対応

→ before の問題を先に指摘させてから after を見せる

---

<!-- _class: lead -->

# 4. Self-host(ローカルLLM)(9分・講師デモ)

トレーニー操作なし

---

## オープンソースモデルをダウンロードして動かす

対象: [Ollama](https://ollama.com/) + [Qwen2.5 1.5B](https://ollama.com/library/qwen2.5)(事前にダウンロード済み)

```bash
ollama list    # ダウンロード済みモデルを確認
```

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "qwen2.5:1.5b",
  "messages": [{"role": "user", "content": "こんにちは、調子はどうですか？"}],
  "stream": false
}'
```

クラウドAPIと同じ「HTTPでプロンプトを送って応答を受け取る」構造。エンドポイントが `localhost` なだけ

---

## 見せ場: Wi-Fiを切って同じコマンドを叩く

同じ応答が返ってくる → モデルの重みはローカルのファイル、推論はローカルのCPU/GPUだけで完結、外部通信は発生しない

| 観点 | クラウドAPI | ローカルLLM |
|------|-----------|------------|
| コスト構造 | 従量課金 | 初期投資+電力 |
| レイテンシ | ネットワーク依存 | ローカル完結 |
| データ主権 | 外部送信あり | 外部に出さない(今実演した通り) |
| モデル性能 | 最新最大が使える | ハードウェア制約 |

判断基準: 機密データ・規制業界・オフライン要件→self-host / スピード優先・最新最大モデル→クラウドAPI / 中間→ハイブリッド

---

<!-- _class: lead -->

# 5. Log Engineering(15分・ハンズオン)

対象: `samples/common-web`

---

## 構造化ログの原則

- 1エントリ = 1オブジェクト(JSON Lines)
- 最低限: `timestamp` / `request_id` / `actor` / `action` / `status` / `duration_ms`

「ログが無いと、後から何が起きたか再現できない」

---

## Step 1: hookのコマンドを構造化ログに(8分)

**アプリのソースは触らない。Claude Codeの設定(hookコマンド)だけ変更**

2.のhookは今こう吐いている: `2026-10-04T... Edit routes/tasks.js`(生ログ)

PostToolUseが渡す `tool_use_id` を `request_id` に使う(自前UUID不要)。`timestamp`/`duration_ms` はClaude Codeから来ないので自分で作る(直前ログとの差分で近似)

```bash
cp exercises/log-settings/after.json .claude/settings.json
```

問い: 「`duration_ms` は本当に『この呼び出しの処理時間』と言える?」→ 実は「前のログからの経過時間」。本当の処理時間は`PreToolUse`との紐付けが必要(発展課題へ)

---

## Step 2: エージェント実行ログの観察(5分)

Workflowの `journal.jsonl` を見せる

問い: 「なぜこのログがあると途中から再開(resume)できるのか?」
→ 各 `agent()` 呼び出しの入出力がペアで記録されているから

Step 1の構造化ログと同じ発想(相関ID + 入出力の記録)

---

<!-- _class: lead -->

# 6. Graph Engineering(15分・ハンズオン)

対象: `samples/common-web` の4ファイル

---

## 概念

複数エージェント処理は必ずDAG(有向非巡回グラフ)
設計判断 = 「どこにバリア(全員待ち合わせ)を置くか」
→ バリアは要る時だけ使う

---

## DAG(Directed Acyclic Graph)とは

- **Directed(有向)**: 矢印に向きがある → 「AをやってからB」という順序がある
- **Acyclic(非巡回)**: ぐるぐる回る矢印(閉路)が無い → 永遠にループしない
- **Graph(グラフ)**: 箱(処理)と矢印(依存関係)の集まり

身近な例: 洗濯の手順 — 洗う → 絞る → 干す(逆戻りしない、必ずこの順)

今日の例: `review:server.js → verify:server.js` のような矢印が4ファイル分。矢印の向きは固定(verifyからreviewには絶対戻らない)

---

## Step 1 vs Step 2: barrier vs pipeline

**Step 1(barrier版)**: `parallel()` でReview全部完了を待ってからVerify開始

**Step 2(pipeline版)**: `pipeline()` で1ファイル目がVerify中に別ファイルがまだReview中

問い: 「どちらが速く終わった? なぜ?」
→ pipelineはステージ間にバリアが無く、遅い1件が全体を止めない

**Step 3**: 書いたpipelineをmermaidで可視化 → 「グラフ設計はコードの形そのもの」

---

## Step 4: Cowork との対比

Claude Coworkの **multi-agent orchestration** は自動でサブエージェントをspin up

問い: 「自動生成されるなら、Graph Engineeringを学ぶ意味は?」
→ 「自動生成されたグラフが最適とは限らない。どこにバリアを置くべきか見抜く目が無いと、非効率でも気づけない」

---

<!-- _class: lead -->

# 7. Security(15分・ハンズオン)

対象: 各自が変更した `samples/common-web`

---

## エージェント特有の脅威モデル

- **Prompt injection**: 外部コンテンツに埋め込まれた指示に従ってしまう
- **サプライチェーンリスク**: MCPサーバー/skillは任意コード実行に等しい
- **秘密情報の扱い**: `.env`コミット漏れ、コード内フォールバック値
- **レビュー前マージ禁止**: 無検証でmergeしない

---

## Step 1: `/security-review` を自分の差分に実行(7分)

期待される発見:
- `requireAdminKey` が `"changeme123"` に弱いフォールバック
- 削除ログの `actor` が実際には「誰が」を特定できていない

見つけた問題をその場で1つ直す

**Step 2(3分)**: 権限スコープの再点検
**Step 3(3分)**: `handouts/security-checklist.md` でサプライチェーンチェック

まとめ: 「生成物は必ずレビューしてからmerge」

---

<!-- _class: lead -->

# 8. Claude Cowork(5分)

説明+宿題配布

---

## 位置づけ

「Claude Codeはコーディング特化。Claude Coworkは同じ発想をコーディング以外の仕事に広げたもの」

- ライセンス確認(その場で)
- ライブデモ: スケジュールタスク設定(例: 毎週月曜に先週の完了タスクをまとめる)
- 宿題配布: `handouts/cowork-homework.md`(自分の定型業務を1つ自動化、次回共有)

---

<!-- _class: lead -->

# 9. まとめ(3分)

---

## 今日通した1本の線

- Harness Engineeringのhookログ → Log Engineeringで構造化
- Harness Engineeringの権限スコープ → Securityで見直し
- Graph Engineeringで手で組んだpipeline/parallel → Coworkなら自動生成、だからこそ設計を見る目が要る
- Ecosystem比較・Self-host(ローカルLLM) → 「今日の内容はClaude Codeだけの話ではない」

## 持ち帰るもの
`security-checklist.md` / `cowork-homework.md` / 各自の `common-web`

---

<!-- _class: lead -->

# Q&A
