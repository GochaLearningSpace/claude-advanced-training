// タスクデータの永続化ヘルパー。DB不要、JSONファイルへ読み書きするだけの簡易実装。
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "tasks.json");

function readTasks() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(tasks, null, 2));
}

module.exports = { readTasks, writeTasks };
