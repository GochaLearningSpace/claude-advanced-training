# 0. イントロ(5分)

## 目的
このセクションで「今日は何が違うか」を明確にし、座学期待を捨てさせる。

## 話す内容(台本)

1. **前提確認**(30秒)
   「skills も MCP も、もう日常で使ってる前提で進めます。今日はその復習はゼロです。」

2. **今日のゴール**(1分)
   - ツールの使い方でなく「仕組み」「運用設計」「脅威モデル」を扱う
   - 具体的に触るキーワード: Harness Engineering / Self-host / Log Engineering / Graph Engineering / Security / Claude Cowork / Claude Artifacts & Design
   - 座学は最小限、ほぼ手を動かす

3. **進め方の説明**(1分)
   - 共通の Web 開発サンプル(`samples/common-web`)を使ってハンズオンを進める
   - GAS に馴染みがある人向けに `samples/gas-backup` も用意しているが、基本は共通サンプルで統一
   - Codex / Antigravity / ローカル LLM / AWS デプロイは講師の手元でのみ動かす(ライセンス・環境の都合)。「みんなの手元でも原理的にはできる」ことが伝わればOK

4. **事前準備の確認**(1.5分、当日冒頭で全員に実施させる)
   - Claude Code にログイン済みか確認
   - `samples/common-web` を各自ローカルに clone 済みか確認(事前配布資料に clone 手順記載、当日やると時間食うので事前課題にしておく)
   - 質問があれば今のうちに

## 講師の当日最初のチェック(セミナー開始 "前" にやる、イントロ台本には含めない)
- [ ] `minitask-handson` リポジトリを private → public に切り替える(`gh repo edit GochaLearningSpace/minitask-handson --visibility public`)。忘れると学生が clone できない

## 事前配布物(講義の数日前に送る)
- `samples/common-web` の GitHub リンク + clone 手順
- Claude Code ログイン確認手順
- 「当日は座学ほぼなし、ハンズオン中心です」の一文(心の準備をさせる)

## common-web の clone 手順(事前配布資料に転記するもの)

> ✅ 対応済み: `common-web` + `gas-backup` を切り出し、専用リポジトリへ push 済み → https://github.com/GochaLearningSpace/minitask-handson
> **⚠️ 残作業**: 現在 **private** リポジトリのため、学生はまだ clone できない。当日までに以下のどちらかを行う:
> - 各学生の GitHub アカウントを collaborator として招待する、または
> - 講義の1〜2日前に public へ切り替える(INSTRUCTOR_NOTES.md 等の講師専用ファイルはこのリポジトリに含めていないので、public 化しても解答が漏れる心配はない)

学生に配布する手順:

### 必要なもの(事前に確認させる)
- Git がインストール済み(`git --version` で確認)
- Node.js 18 以上がインストール済み(`node --version` で確認)
- Git に不慣れな学生向けの代替: GitHub の「Code → Download ZIP」でも可(clone の代わりに ZIP 展開でOK)

### 手順

```bash
git clone https://github.com/GochaLearningSpace/minitask-handson.git
cd minitask-handson/common-web
npm install
cp .env.example .env
npm start
```

ブラウザで `http://localhost:3000` を開く。

### 完了チェックリスト(学生自身に確認させる)
- [ ] `http://localhost:3000` が開き、"MiniTask" の画面が表示される
- [ ] 新しいタスクをフォームから追加できる
- [ ] タスクのチェックボックスをクリックすると完了状態になる

### よくあるトラブルと対処
- `npm install` でエラー → Node.js のバージョンを確認(18未満だと動かない可能性)
- `npm start` で `EADDRINUSE`(ポート使用中)→ `.env` の `PORT` を別の番号(例: `3001`)に変更してから再実行
- `git clone` が失敗する/git 自体が使えない → GitHub の ZIP ダウンロードで代替
- `.env` を作り忘れて起動 → 動くには動くが、7. Security セクションで扱う「弱いフォールバック」の状態のまま(むしろ当日の教材としてはこのままでもよい、無理に直させない)

## 講師メモ
- ここで時間を使いすぎない。5分厳守。
- 「今日教えることは全部 Claude Code の中で完結するもの」と明言すると、後半の Codex/Antigravity/Cowork が「余談」ではなく「視野拡張」だと伝わりやすい。
