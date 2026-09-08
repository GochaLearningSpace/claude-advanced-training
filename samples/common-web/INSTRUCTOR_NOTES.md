# 講師専用メモ(トレーニーに配布しない)

MiniTask に仕込んである教育用の仕掛け一覧。各セクションでこれを「発見させる」流れにする。

## 1. 弱いフォールバック秘密情報(Security セクション用)

`routes/tasks.js` の `requireAdminKey`:

```js
const expected = process.env.ADMIN_KEY || "changeme123"; // ← 意図的な弱いフォールバック
```

`.env` を作り忘れても `"changeme123"` で動いてしまう。`.env.example` には別のプレースホルダー(`your-secret-key-here`)を書いてあるので、コードを読まないと実際のフォールバック値には気づけない設計。

**使うセクション**: 7. Security(`/security-review` 実行で発見させる)、5. Log Engineering(管理者操作のログに「誰が」の情報が無いことも合わせて指摘できる)

## 2. 過剰権限 settings.json(Harness Engineering セクション用)

リポジトリには含めていない(安全分類器にブロックされたため。過剰権限設定をリポジトリに常設するのは適切でもない)。

代わりに **セクション2のハンズオン内でトレーニー自身に以下を一度書かせる**:

```json
{
  "permissions": {
    "allow": ["Bash(*)", "WebFetch(*)", "Write(*)"]
  }
}
```

書かせた後、「これの何が問題か」を議論させてから、実際に使うコマンドだけに絞った設定へ書き直させる(例: `Bash(npm run *)`, `Bash(git *)` など)。

**使うセクション**: 2. Harness Engineering(権限スコープ演習)、7. Security(見直し演習で再登場させる)

## 3. 管理者操作ログの薄さ(Log Engineering セクション用)

`routes/tasks.js` の DELETE ハンドラ:

```js
console.log(`[ADMIN] task deleted: id=${removed.id} title="${removed.title}"`);
```

`who`(誰が削除したか)、`request_id`、`duration` 等のフィールドが無い。ここを structured logging に拡張させる。

**使うセクション**: 5. Log Engineering

## 4. リクエストログの粒度(Log Engineering セクション・発展課題)

`server.js` のミドルウェアは `method` と `path` のみ。correlation ID もステータスコードも記録していない。

**位置づけ**: 本編15分の必須演習ではない。`materials/05-log-engineering.md` の「発展課題(時間が余ったら)」として、早く終わったトレーニー向けに用意してある。全員に拡張させる想定ではない点に注意。

## 進行上の注意

- 仕掛けは「見つけさせる」ためのものなので、口頭で先に言わない
- Security セクションで `/security-review` を実行させた際、上記1・2・3 が指摘候補として挙がるはず。挙がらなかった場合は誘導質問(「管理者用の操作、何か気になるところない?」)で拾わせる
