# 0. イントロ + ライブ環境セットアップ(15分)

## 目的
このセクションで「今日は何が違うか」を明確にし、座学期待を捨てさせる。**事前配布ができなかったため、clone/セットアップもこの場でやる**(旧版は事前課題にしていたが、今回は時間を確保してライブで行う)。

## 話す内容(台本)

1. **前提確認**(30秒)
   「skills も MCP も、もう日常で使ってる前提で進めます。今日はその復習はゼロです。」

2. **今日のゴール**(1分)
   - ツールの使い方でなく「仕組み」「運用設計」「脅威モデル」を扱う
   - 具体的に触るキーワード: Harness Engineering / Self-host / Log Engineering / Graph Engineering / Security / Claude Cowork / Claude Artifacts & Design
   - 座学は最小限、ほぼ手を動かす

   **3つのEngineeringの地図(ここで一言だけ、詳細は各セクションで)**
   - **Harness Engineering(2.)**: エージェント1体が「どう動くか」の土台そのもの。ループ+権限(permissions)+観測(hook)+検証ループの4点セット
   - **Log Engineering(5.)**: Harnessのhookが吐きっぱなしの生ログを、「後から何が起きたか再現できる」構造化データ(JSON Lines)に育てる話。2.の続き
   - **Graph Engineering(6.)**: エージェントを複数並行で動かすと、実行順序そのものがグラフ(DAG)になる。1体の土台(Harness)→その記録の構造化(Log)の先にある、「複数体の構造設計」の話
   - 流れ: **Harness(1体の土台) → Log(その記録を構造化) → Graph(複数体の構造設計)**。Security(7.)はこの3つ全部に横断して効く脅威モデルの話として最後に回収する

   **⚠️ 講師向け補足(「Logが一番基本では?」とトレーニーに聞かれたら)**: 一般的な「ログ出力」の基本という意味ではLogが一番簡単に見える。だが今日のLog Engineeringは「hookが吐くログを構造化する」話で、hook自体はHarness EngineeringのStep1で作る。ログを構造化する対象がまだ無い状態ではLogから教えられない。だからこの順番(Harness→Log→Graph)は技術的な依存関係であって、恣意的な並びではない。

3. **進め方の説明**(1分)
   - 共通の Web 開発サンプル(`samples/common-web`、通称 MiniTask)を使ってハンズオンを進める
   - GAS に馴染みがある人向けに `samples/gas-backup` も用意しているが、基本は共通サンプルで統一
   - Codex / Antigravity / ローカル LLM は講師の手元でのみ動かす(ライセンス・環境の都合)。「みんなの手元でも原理的にはできる」ことが伝わればOK

4. **ライブ環境セットアップ(10分)**

   資料を事前配布できなかったので、今この場で全員にやらせる。講師は時間を区切って巡回し、詰まっている人を拾う。

   ### 全員で画面共有しながら実施させる手順

   ```bash
   git clone https://github.com/GochaLearningSpace/minitask-handson.git
   cd minitask-handson/common-web
   npm install
   cp .env.example .env
   npm start
   ```

   ブラウザで `http://localhost:3000` を開く。

   **必要なもの(その場で確認)**
   - Git インストール済み(`git --version`)
   - Node.js 18 以上(`node --version`)
   - Git/clone が使えない人 → GitHub の「Code → Download ZIP」で代替可

   **完了チェックリスト(各自に確認させる)**
   - [ ] `http://localhost:3000` が開き、"MiniTask" の画面が表示される
   - [ ] 新しいタスクをフォームから追加できる
   - [ ] タスクのチェックボックスをクリックすると完了状態になる

   **よくあるトラブルと対処(講師は即答できるようにしておく)**
   - `npm install` でエラー → Node.js のバージョン確認(18未満だと動かない可能性)
   - `npm start` で `EADDRINUSE`(ポート使用中)→ `.env` の `PORT` を別の番号(例: `3001`)に変更してから再実行
   - `git clone` が失敗する/git 自体が使えない → GitHub の ZIP ダウンロードで代替
   - `.env` を作り忘れて起動 → 動くには動くが、7. Security セクションで扱う「弱いフォールバック」の状態のまま(むしろ当日の教材としてはこのままでもよい、無理に直させない)
   - 会場Wi-Fiが遅く `npm install` が長引く → 先に進めている人から画面を見せてもらう形で待機時間を潰す。最悪、講師のローカルで動いている画面を一時的に共有して2セクション目に進む(セットアップは各自バックグラウンドで続行させる)

5. **質問**(残りがあれば)

## 講師の当日最初のチェック(セミナー開始 "前" にやる、イントロ台本には含めない)
- [ ] **最重要**: `minitask-handson` リポジトリを private → public に切り替える(`gh repo edit GochaLearningSpace/minitask-handson --visibility public`)。事前配布・招待ができなかったため、**これを忘れると全員が clone できず冒頭から詰まる**。セッション開始より前に必ず実施

## 当日配布物(セッション開始時にその場で渡す。事前配布なし)
- `minitask-handson` の GitHub リンク(上記セットアップ手順と合わせて画面共有 or チャットで共有)
- `handouts/security-checklist.md`(7. Security で使用)
- `handouts/cowork-homework.md`(8. Cowork で使用)

## 講師メモ
- 旧版は「事前課題」前提で本編5分だったが、今回は事前配布が間に合わなかったためセットアップ込みで15分に拡大。その分は 1. エコシステム比較(12→7分)と 4. Self-host(12→9分、AWSデプロイデモは削除してローカルLLMデモに一本化)から時間を移している(`README.md` のアジェンダ表を参照)
- 「今日教えることは全部 Claude Code の中で完結するもの」と明言すると、後半の Codex/Antigravity/Cowork が「余談」ではなく「視野拡張」だと伝わりやすい
- セットアップに時間を取られすぎないよう、10分経過したら未完了の人がいても一旦次セクションへ進む(Harness Engineeringの最初の数分でも並行して続けさせられる)
