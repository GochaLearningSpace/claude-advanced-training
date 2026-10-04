# Claude アドバンストトレーニング(2時間)

対象: skills / MCP を既に理解し、日常的に使っている受講者。
形式: ハンズオン中心(座学最小限)。全員 Claude Code ライセンス保持前提。
サンプル: 共通の Web 開発サンプルをメインに使用。GAS に馴染みのある受講者向けに GAS 版サンプルも予備で用意。

## 全体アジェンダ(119分 + 予備1分)

> ⚠️ 事前配布ができなかった(当日のみ資料・サンプルを渡す)ため、イントロでライブ clone/セットアップの時間を確保。その分を 1. と 4. から移動して帳尻を合わせている。詳細は `materials/00-intro.md` 参照

| # | セクション | 形式 | 時間 |
|---|-----------|------|------|
| 0 | イントロ + ライブ環境セットアップ | 座学+セットアップ | 15分 |
| 1 | エコシステム比較(Claude Code / Codex / Antigravity) | 講師デモのみ | 7分 |
| 2 | Harness Engineering(Claude Cowork の outcomes/webhooks 対比込み) | ハンズオン | 20分 |
| 3 | Claude Artifacts + Design 原則 | ハンズオン(独立枠) | 15分 |
| 4 | Self-host(ローカルLLM) | 講師デモのみ | 9分 |
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
- [x] `minitask-handson` を public に切り替え済み(2026-10-04確認、`gh repo view` で visibility: PUBLIC を確認)
- [x] 01-ecosystem-comparison.md の比較表、Codex/Antigravity の公式ドキュメントで2026年10月時点の仕様に裏取り済み(Antigravity 2.0でサブエージェント/hooks/CLIが追加された点を反映)
- [x] 02-harness-engineering.md の Step 1、hookの実行ロジックを `.claude/hooks/harness-hook.js`(実ファイル)に切り出し済み。`settings.json` の `command` は `node .claude/hooks/harness-hook.js` のみで、長いワンライナーをJSONに埋め込む旧方式は廃止(bash/PowerShell/cmdでクォートが壊れる問題があったため)。実機で動作確認済み
- [x] `training-concepts` skill を作成し `minitask-handson/common-web/.claude/skills/` に配布済み(講師・トレーニー双方が概念質問をClaude Codeに直接投げられる。クリーンcloneで配置確認済み)
- [x] `harness-graph-demo` skill を追加(`minitask-handson/common-web/.claude/skills/` + ルート `.claude/skills/` 両方に配布済み)。Harness Engineering(hook on/off、権限スコープbefore/after)・Log Engineering(生ログ/構造化ログ切替)・Graph Engineering(barrier/pipeline workflow実行)を、説明だけでなく**実際に動かす**ところまでスキルが担当する。概念説明は `training-concepts` が担当、実行は `harness-graph-demo` が担当、と役割分担済み
- [x] Graph Engineering の実施後コード(barrier版・pipeline版)を `samples/common-web/exercises/graph-workflows/{step1-barrier,step2-pipeline}.js` として保存済み(他セクションのbefore/after参照ファイルと同じ位置づけ)
- [x] 4. Self-host セクションから AWS デプロイデモを削除し、ローカルLLM(Ollama + qwen2.5:1.5b)のみのデモに変更(AWSアカウントが新規審査中でApp Runner/CloudShellとも利用不可だったため、GCP Cloud Runへ一度切り替えたが、そもそもデプロイデモ自体を無くす方針に確定)。`materials/04-self-host-aws.md`・`materials/slides.md`・`materials/00-intro.md` を書き換え済み
- [x] ローカルLLM(Ollama + qwen2.5:1.5b)の動作確認: ダウンロード・`localhost:11434` での応答・Wi-Fiオフでも応答が返ることまで確認済み
- [ ] Claude Cowork のライセンス・提供状況を当日朝に再確認(8.)
- [x] samples/common-web を `npm install && npm start` で動作確認(クリーン環境で)。`GET /api/tasks` 応答まで確認済み
- [ ] samples/gas-backup を実際に clasp push まで通しておく(予備として使う場合)
