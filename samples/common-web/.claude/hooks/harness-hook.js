// 2. Harness Engineering Step 1 で使うPostToolUseフック。
// Claude Codeがstdin経由で渡してくるツール実行結果のJSONを読み、
// 1行の生ログとして .claude/harness.log に追記する。
"use strict";

const fs = require("fs");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);
    const filePath = (payload.tool_input && payload.tool_input.file_path) || "";
    const line = `${new Date().toISOString()} ${payload.tool_name} ${filePath}`;
    fs.appendFileSync(".claude/harness.log", line + "\n");
  } catch (e) {
    // hookの失敗でエージェントの操作自体を止めたくないので、ここでは何もしない
  }
});
