// タスク管理API。GET/POST/PUT/DELETE の一式。
//
// 講師用メモ(INSTRUCTOR_NOTES.md にも記載):
//   DELETE だけ requireAdminKey で保護している。ADMIN_KEY 環境変数が未設定の場合、
//   "changeme123" という弱いデフォルト値にフォールバックする実装になっている。
//   これは「ハードコードされたフォールバック秘密情報」の典型例として、
//   Security セクションの /security-review 演習でわざと発見させるための仕込み。
"use strict";

const express = require("express");
const { readTasks, writeTasks } = require("../lib/store");

const router = express.Router();

function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_KEY || "changeme123"; // ← 意図的な弱いフォールバック
  const provided = req.header("x-admin-key");
  if (provided !== expected) {
    return res.status(403).json({ error: "admin key required" });
  }
  next();
}

router.get("/", (req, res) => {
  res.json(readTasks());
});

router.post("/", (req, res) => {
  const { title } = req.body;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }
  const tasks = readTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const task = { id: nextId, title: title.trim(), done: false };
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const tasks = readTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }
  if (typeof req.body.title === "string") task.title = req.body.title;
  if (typeof req.body.done === "boolean") task.done = req.body.done;
  writeTasks(tasks);
  res.json(task);
});

// 管理者操作。Log Engineering セクションで「この操作だけ構造化ログを残す」演習に使う。
router.delete("/:id", requireAdminKey, (req, res) => {
  const id = Number(req.params.id);
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "task not found" });
  }
  const [removed] = tasks.splice(index, 1);
  writeTasks(tasks);
  console.log(`[ADMIN] task deleted: id=${removed.id} title="${removed.title}"`);
  res.json(removed);
});

module.exports = router;
