# 1. エコシステム比較(7分・講師デモのみ)

> イントロのライブセットアップに時間を回したため12分→7分に短縮(`README.md` アジェンダ参照)。デモは「見せる」項目を絞り、判断軸の提示を優先する

トレーニー操作なし。画面共有で見せるだけ。目的は「Claude Code の外側にある選択肢を知り、Claude Code の設計判断の意味を理解する」こと。

## 比較表(配布資料にも掲載・2026年10月時点で裏取り済み)

| 観点 | Claude Code | Codex(OpenAI) | Antigravity(Google、2.0) |
|------|------------|----------------|----------------------|
| 実行形態 | CLI / IDE 拡張 / SDK | CLI / クラウドサンドボックス実行 | スタンドアロンデスクトップアプリ + ネイティブCLI(2.0で追加) |
| エージェントループ | 単一ループ+明示的サブエージェント起動 | サンドボックス内タスク実行特化 | メインエージェントが動的にサブエージェントを起動(2.0で追加、Claude Codeに接近) |
| ツール権限モデル | 許可モード+settings.json でのスコープ制御 | 3段階サンドボックスポリシー(read-only / workspace-write / danger-full-access)+`/permissions`プリセット | プロジェクト単位(2.0でworkspace概念から変更)の権限設定、承認待ちをManager画面で一覧 |
| 拡張性 | skills / hooks / MCP / Workflow(独自DAG) | MCP 対応、AGENTS.md による指示拡張 | MCP対応に加え、2.0でJSON hooksと`/schedule`によるcron実行を追加(Claude Codeのhooksと概念が重なる) |
| 得意分野 | 拡張性・カスタムワークフロー構築 | コード実行系タスクの隔離実行 | Manager画面での複数エージェント並行オーケストレーション、ブラウザ操作統合 |
| コンテキスト管理 | compaction + ファイルベースメモリ | セッション単位 | プロジェクト単位(2.0で「workspace」から改称)で複数タスクを並行管理 |

**2026年10月時点の補足(デモで一言触れる)**: Antigravity 2.0 でサブエージェント・hooks・CLI が追加され、Claude Code との差が縮まっている。「ツールごとに思想が違う」という話から、「同じ設計課題(権限・拡張性・並行実行)に各社が収束しつつある」という話に軽くシフトさせると、次の Harness Engineering への橋渡しが自然になる。

## デモ進行(講師手元)

1. (2分)同じお題(例: 「このリポジトリの TODO コメントを一覧化して」)を3ツールに投げて、実行の見え方の違いを見せる
   - Claude Code: ターミナルログの流れ、ツール呼び出しの透明性
   - Codex: サンドボックス実行の様子
   - Antigravity: マネージャービューでのタスク管理画面

2. (2分)権限モデルの違いを比較表で示す(ライブ操作の深追いはしない。Claude Codeのみ許可プロンプトを一瞬見せる程度)

3. (2分)「じゃあ何を選ぶべきか」の判断軸を提示
   - 拡張性・カスタムhook重視 → Claude Code
   - コード実行の隔離性重視 → Codex
   - ブラウザ操作込みのマルチタスク管理重視 → Antigravity

4. (1分)まとめ: 「今日この後扱う Harness Engineering / Graph Engineering は、実はどのツールにも共通する設計の話。ツール選びの話ではなく、その裏にある仕組みの話をする」と次セクションへの橋渡し

## 講師メモ
- ここで深追いしない。次の Harness Engineering セクションで仕組みの話を厚くするので、ここは「見せるだけ」に徹する
- ライブデモがネットワーク等の都合で失敗した場合に備え、事前録画のスクリーンキャプチャをバックアップとして用意しておく
- 比較表は2026年10月時点の公式情報で裏取り済み(出典: [Codex Config Reference](https://developers.openai.com/codex/config-reference)、[Codex CLI Reference](https://developers.openai.com/codex/cli/reference)、[Antigravity 2.0 発表](https://antigravity.google/blog/introducing-google-antigravity-2/)、[Antigravity Changelog](https://antigravity.google/docs/changelog/))。変化が速い領域のため、当日1〜2日前に軽く再確認すると安全
