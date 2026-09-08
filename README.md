# Claude アドバンストトレーニング(2時間)

対象: skills / MCP を既に理解し、日常的に使っている受講者。
形式: ハンズオン中心(座学最小限)。全員 Claude Code ライセンス保持前提。
サンプル: 共通の Web 開発サンプルをメインに使用。GAS に馴染みのある受講者向けに GAS 版サンプルも予備で用意。

## 全体アジェンダ(117分 + 予備3分)

| # | セクション | 形式 | 時間 |
|---|-----------|------|------|
| 0 | イントロ | 座学 | 5分 |
| 1 | エコシステム比較(Claude Code / Codex / Antigravity) | 講師デモのみ | 12分 |
| 2 | Harness Engineering(Claude Cowork の outcomes/webhooks 対比込み) | ハンズオン | 20分 |
| 3 | Claude Artifacts + Design 原則 | ハンズオン(独立枠) | 15分 |
| 4 | Self-host + AWS デプロイ | 講師デモのみ | 12分 |
| 5 | Log Engineering | ハンズオン | 15分 |
| 6 | Graph Engineering(Claude Cowork のマルチエージェント編成対比込み) | ハンズオン | 15分 |
| 7 | Security | ハンズオン | 15分 |
| 8 | Claude Cowork(実務利用+宿題) | 説明+宿題配布 | 5分 |
| 9 | まとめ | 座学 | 3分 |

## ディレクトリ構成

```
ClaudeTraining/
├── README.md                  ← 本ファイル(全体アジェンダ)
├── materials/                 ← セクションごとの講師用台本+配布資料
│   ├── 00-intro.md
│   ├── 01-ecosystem-comparison.md
│   ├── 02-harness-engineering.md
│   ├── 03-artifacts-design.md
│   ├── 04-self-host-aws.md
│   ├── 05-log-engineering.md
│   ├── 06-graph-engineering.md
│   ├── 07-security.md
│   ├── 08-cowork.md
│   └── 09-wrap-up.md
├── samples/
│   ├── common-web/             ← ハンズオン共通サンプル(Web開発)
│   └── gas-backup/             ← GAS版予備サンプル
└── handouts/                   ← 当日配布用チェックリスト・宿題プリント
```

## 進行状況

- [x] README / 全体設計
- [x] materials/00-intro.md
- [x] materials/01-ecosystem-comparison.md
- [x] samples/common-web 設計・作成
- [x] samples/gas-backup 設計・作成
- [x] materials/02〜09
- [x] handouts/

## 講師向け残タスク(当日までに)

- [x] `common-web` + `gas-backup` を切り出し、独立リポジトリへ push 済み → https://github.com/GochaLearningSpace/minitask-handson (INSTRUCTOR_NOTES.md は含めていない、答え漏洩なし)
- [ ] **最優先**: 上記リポジトリは現在 private。**当日、講師自身が public に切り替える**(`gh repo edit GochaLearningSpace/minitask-handson --visibility public`)。切り替え忘れると学生が clone できないので、当日の最初のチェック項目に入れる
- [ ] `samples/common-web/INSTRUCTOR_NOTES.md` は `ClaudeTraining` 側にのみ残っている(意図通り)。今後 common-web の内容を更新する際は、`ClaudeTraining/samples/common-web` と `minitask-handson/common-web` の両方に反映すること(二重管理になっている点に注意)
- [ ] 01-ecosystem-comparison.md の比較表、Codex/Antigravity の公式ドキュメントで最新仕様と裏取りする(知識カットオフから8ヶ月経過、変化が速いプロダクトのため)
- [ ] 02-harness-engineering.md の hook コマンド、現行 Claude Code バージョンの hooks リファレンスで実際のフィールド名を確認し、動くコマンドに差し替える
- [ ] Real Estate Simulator の Self-Tests メニューをデモできる状態にしておく(3. Step 3)
- [ ] ローカルLLM環境・AWSデプロイ経路のリハーサル(4. Self-host + AWS)
- [ ] Claude Cowork のライセンス・提供状況を当日朝に再確認(8.)
- [ ] samples/common-web を `npm install && npm start` で動作確認(クリーン環境で)
- [ ] samples/gas-backup を実際に clasp push まで通しておく(予備として使う場合)
