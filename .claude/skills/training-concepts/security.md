# Security(エージェント運用のセキュリティ)

## 脅威モデル4点
- **Prompt injection**: Web取得コンテンツやファイル内容に埋め込まれた指示にエージェントが従ってしまう
- **サプライチェーンリスク**: MCPサーバー/skillは任意コード実行に等しい。導入前の検証が要る
- **秘密情報の扱い**: `.env`のコミット漏れ、コード内フォールバック値
- **レビュー前マージ禁止**: エージェントの出力を無検証でmergeしない運用ルール

## このリポジトリに仕込まれている問題
`routes/tasks.js` の `requireAdminKey`:
```js
const expected = process.env.ADMIN_KEY || "changeme123"; // ← 意図的な弱いフォールバック
```
`.env` を作り忘れても `"changeme123"` で動いてしまう。`.env.example` には別のプレースホルダー(`your-secret-key-here`)が書いてあるので、コードを読まないと実際のフォールバック値には気づけない。

**直し方の例**:
```js
const expected = process.env.ADMIN_KEY;
if (!expected) throw new Error("ADMIN_KEY is not set");
```
未設定ならサイレントにフォールバックせず、起動時にエラーで落とす。

もう1つの論点: 5. Log Engineeringで構造化したログの `actor` フィールドが、実際には「誰が」削除したかを特定できていない(admin/unknownの二値のみ)。

## `/security-review` の使い方
自分がこれまでのセクションで変更したMiniTaskの差分に対して実行する。期待される発見は上記の弱いフォールバックと、ログの薄さ。見つからない場合の誘導質問:「管理者用の操作、`.env`を作り忘れたらどうなる?」

## 権限スコープの再点検
2. Harness Engineeringで絞り込んだ `permissions.allow` を見直す:「今のスコープで、まだ広すぎる箇所はないか」。

## サプライチェーンチェックリスト(`handouts/security-checklist.md`)
自分が普段使っているMCPサーバー/skillを1つ選んで当てはめる:
- 提供元は信頼できるか(OSSならstar数・メンテ状況、社内製なら管理者が明確か)
- 実行時にどこまでのファイル/ネットワークアクセスを要求するか
- 導入前にコードを読んだか、読める分量か

## まとめ
「今日直した1件は氷山の一角。エージェント運用の恒久ルールとして、生成物は必ずレビューしてからmergeする」
