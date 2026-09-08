/**
 * MiniTask(GAS版) — Claude アドバンストトレーニング用の予備ハンズオンサンプル。
 * common-web(Node.js版)と同じ機能・同じ教育用の仕込みを、GAS に馴染みのある
 * 受講者向けに再現したもの。基本は common-web を使い、これは予備。
 *
 * 意図的な設計(講師用。詳細は INSTRUCTOR_NOTES.md 参照):
 *   - deleteTask_ は管理者キーで保護しているが、Script Properties が未設定の場合
 *     弱いデフォルト値にフォールバックする(Security セクションの題材)
 *   - ログは Logger.log のみで、Web App 経由の実行では追いにくい
 *     (Log Engineering セクションで、シートベースログへの移行を扱う題材)
 */

const SHEET_NAME = "Tasks";

function doGet(e) {
  const tasks = readTasks_();
  return ContentService
    .createTextOutput(JSON.stringify(tasks))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);

  if (params.action === "create") {
    const task = createTask_(params.title);
    return jsonResponse_(task);
  }

  if (params.action === "delete") {
    // ⚠️ 意図的な弱いフォールバック。Security セクションで発見させる。
    const expected = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "changeme123";
    if (params.adminKey !== expected) {
      return jsonResponse_({ error: "admin key required" }, 403);
    }
    const removed = deleteTask_(params.id);
    // ログはこれだけ。「誰が」「いつ」の相関IDが無い。Log Engineering セクションの題材。
    Logger.log("[ADMIN] task deleted: id=" + removed.id + " title=\"" + removed.title + "\"");
    return jsonResponse_(removed);
  }

  return jsonResponse_({ error: "unknown action" }, 400);
}

function readTasks_() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const [header, ...body] = rows;
  return body
    .filter((row) => row[0] !== "")
    .map((row) => ({ id: row[0], title: row[1], done: row[2] === true }));
}

function createTask_(title) {
  const sheet = getSheet_();
  const tasks = readTasks_();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  sheet.appendRow([nextId, title, false]);
  return { id: nextId, title: title, done: false };
}

function deleteTask_(id) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      const removed = { id: rows[i][0], title: rows[i][1] };
      sheet.deleteRow(i + 1);
      return removed;
    }
  }
  throw new Error("task not found: " + id);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "title", "done"]);
  }
  return sheet;
}

function jsonResponse_(obj, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
