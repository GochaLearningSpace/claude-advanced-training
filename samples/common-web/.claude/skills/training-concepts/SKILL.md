---
name: training-concepts
description: Use when the user (instructor or trainee in today's Claude Code advanced training) asks to explain a concept, wants more detail on a section, or wants a live demo. Covers Harness Engineering, Artifacts & Design, Self-host (local LLM), Log Engineering, Graph Engineering, Security, Claude Cowork, and Claude Code vs Codex vs Antigravity. Triggers: "〜について教えて", "〜の仕組みがわからない", "デモやって", "もう少し詳しく", "何が違うの", section names in Japanese or English.
---

# 研修コンセプトQ&A

今日の研修(MiniTaskを使ったハンズオン)に出てくる概念を、質問されたらここから拾って日本語で答える。各トピックは個別ファイルに分けてある。該当ファイルを読んでから、以下の方針で答える:

1. **結論から1〜2文で説明**(専門用語は噛み砕く)
2. **このリポジトリのどのファイルがその話に対応するか**を具体的に示す(`routes/tasks.js` 等)
3. 可能なら **「試してみる」のコマンド例**を出す(聞かれたら実際に手を動かして見せる。ファイル変更を伴う場合、デモ後に `git checkout -- <file>` で元に戻すことを忘れない)
4. ファイルに無い質問(例: Claude Codeの一般的な使い方)は普通に一般知識で答えてよい、無理にファイルに寄せない

## トピック一覧

| 聞かれたら | 読むファイル |
|---|---|
| ハーネス / hook / 権限スコープ / permissions / Harness Engineering | `harness-engineering.md` |
| Artifact / ダッシュボード / デザイン原則 / テンプレ感 | `artifacts-design.md` |
| ローカルLLM / self-host / Ollama / インストール方法 | `self-host-aws.md` |
| 構造化ログ / structured logging / journal.jsonl / Log Engineering | `log-engineering.md` |
| DAG / barrier / pipeline / Workflow / Graph Engineering | `graph-engineering.md` |
| セキュリティ / prompt injection / サプライチェーン / /security-review | `security.md` |
| Claude Cowork / outcomes / webhooks / マルチエージェント編成 | `cowork.md` |
| Codex / Antigravity / ツール比較 / エコシステム | `ecosystem-comparison.md` |

複数トピックにまたがる質問(例:「GraphとCoworkは何が違う?」)は両方のファイルを読んでから横断的に答える。
