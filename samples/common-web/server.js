// MiniTask — Claude アドバンストトレーニング用の共通ハンズオンサンプル
//
// 意図的な設計になっている点(講師用。詳細は INSTRUCTOR_NOTES.md 参照):
//   - DELETE エンドポイントは管理者キーで保護しているが、
//     環境変数未設定時に弱いデフォルト値へフォールバックする(Security セクションの題材)
//   - リクエストログを最小限の console.log にとどめている(Log Engineering セクションの題材)
"use strict";

const express = require("express");
const path = require("path");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// リクエストごとに最小限のログを出す。
// Log Engineering セクションで「このログを構造化フィールドに拡張する」演習を行う。
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`MiniTask server listening on http://localhost:${PORT}`);
});
