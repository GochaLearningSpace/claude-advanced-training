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

- [x] `ClaudeTraining` 自体を独立 private リポジトリ化 → https://github.com/GochaLearningSpace/claude-advanced-training (唯一の編集対象、INSTRUCTOR_NOTES.md 含む)
- [x] `common-web` + `gas-backup` をトレーニー配布用に切り出し → https://github.com/GochaLearningSpace/minitask-handson (private)。`scripts/publish-samples.sh` で `ClaudeTraining/samples` から自動同期(INSTRUCTOR_NOTES.md は自動的に除外される)。**編集は必ず `ClaudeTraining` 側だけで行い、変更後にこのスクリプトを実行すること**(minitask-handson を直接編集しない)
- [ ] **最優先**: `minitask-handson` は現在 private。**当日、講師自身が public に切り替える**(`gh repo edit GochaLearningSpace/minitask-handson --visibility public`)。切り替え忘れるとトレーニーが clone できないので、当日の最初のチェック項目に入れる
- [ ] 01-ecosystem-comparison.md の比較表、Codex/Antigravity の公式ドキュメントで最新仕様と裏取りする(知識カットオフから8ヶ月経過、変化が速いプロダクトのため)
- [ ] 02-harness-engineering.md の Step 1、hook コマンドが現時点でプレースホルダーのまま(`<公式ドキュメントで確認した...コマンド>`)。当日までに実機で動作確認し、コピペで配布できる具体的なコマンドに差し替える
- [ ] Real Estate Simulator の Self-Tests メニューをデモできる状態にしておく(3. Step 3)
- [ ] ローカルLLM環境・AWSデプロイ経路のリハーサル(4. Self-host + AWS)
- [ ] Claude Cowork のライセンス・提供状況を当日朝に再確認(8.)
- [ ] samples/common-web を `npm install && npm start` で動作確認(クリーン環境で)
- [ ] samples/gas-backup を実際に clasp push まで通しておく(予備として使う場合)
