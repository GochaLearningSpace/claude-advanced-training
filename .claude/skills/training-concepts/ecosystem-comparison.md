# Claude Code vs Codex vs Antigravity

## 目的
Claude Codeの外側にある選択肢を知り、Claude Codeの設計判断の意味を理解する。

## 比較表(2026年10月時点で裏取り済み)

| 観点 | Claude Code | Codex(OpenAI) | Antigravity 2.0(Google) |
|------|------------|----------------|----------------------|
| 実行形態 | CLI/IDE拡張/SDK | CLI/クラウドサンドボックス | デスクトップアプリ+ネイティブCLI |
| エージェントループ | 単一ループ+明示的サブエージェント起動 | サンドボックス内タスク実行特化 | メインエージェントが動的にサブエージェントを起動(Claude Codeに接近) |
| 権限モデル | settings.jsonでのスコープ制御 | 3段階サンドボックス(read-only/workspace-write/danger-full-access) | プロジェクト単位、承認待ちをManager画面で一覧 |
| 拡張性 | skills/hooks/MCP/Workflow | MCP + AGENTS.md | MCP + JSON hooks + `/schedule`(cron実行) |
| 得意分野 | 拡張性・カスタムワークフロー構築 | コード実行系タスクの隔離実行 | Manager画面での複数エージェント並行オーケストレーション |

**ポイント**: Antigravity 2.0でサブエージェント/hooks/CLIが追加され、Claude Codeとの差が縮まっている。各社、同じ設計課題(権限・拡張性・並行実行)に収束しつつある。

## 判断軸
- 拡張性・カスタムhook重視 → Claude Code
- コード実行の隔離性重視 → Codex
- ブラウザ操作込みのマルチタスク管理重視 → Antigravity

今日のHarness Engineering / Graph Engineeringは、実はどのツールにも共通する設計の話。ツール選びの話ではなく、その裏にある仕組みの話。
