// 5. Log Engineering Step 1 で使うPostToolUseフック。
// 2. Harness Engineeringのhook(harness-hook.js)を「構造化ログ」に進化させた版。
// アプリのソースコードは一切触らず、この設定ファイルだけで実現する。
"use strict";

const fs = require("fs");

const LOG_FILE = ".claude/harness.log";

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input);

    // duration_msはClaude Codeから渡されないので、直前のログ行との差分で近似する。
    let previousTimestamp = null;
    try {
      const lines = fs.readFileSync(LOG_FILE, "utf8").trim().split("\n");
      const lastLine = lines[lines.length - 1];
      if (lastLine) previousTimestamp = JSON.parse(lastLine).timestamp;
    } catch (e) {
      // ログファイルがまだ無い、または1行目なのでprevious無し。問題ない。
    }

    const now = new Date();
    const entry = {
      timestamp: now.toISOString(),
      request_id: payload.tool_use_id,
      actor: "agent",
      action: payload.tool_name,
      target: (payload.tool_input && payload.tool_input.file_path) || null,
      status: "success",
      duration_ms: previousTimestamp ? now - new Date(previousTimestamp) : null,
    };

    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch (e) {
    // hookの失敗でエージェントの操作自体を止めたくないので、ここでは何もしない
  }
});
