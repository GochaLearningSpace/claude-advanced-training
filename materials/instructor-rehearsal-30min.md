# 講師用 30分リハーサルガイド

本番は117分だが、当日前に講師1人で「全セクションが実際に動くか」を30分で一周確認するための台本。トレーニーには配布しない。

**前提**: `materials/` 配下の台本・スライド(`slides.md`)は読了済み。ここでは「動作確認」に絞る。

**進め方**: 各セクションの合計が30分になるよう時間を固定してある。時間が来たら完了してなくても次へ進む(リハーサルなので厳密な完了は求めない)。

---

## 0. イントロ(1分)

- [ ] `materials/00-intro.md` の「当日最初のチェック」を確認
- [ ] `minitask-handson` リポジトリをセッション開始前に public へ切り替え済みか確認(事前配布なしのため、これが唯一のトレーニー向けclone手段)
- [ ] イントロが「ライブclone/セットアップ込みで15分」に変わっている前提でリハーサルする(`materials/00-intro.md` 参照)

---

## 1. エコシステム比較(2分)

- [ ] `slides.md` の比較表スライドを1枚ずつ目で追う(ライブ操作は本番当日のみ)
- [ ] 比較表の出典リンク(Codex Config Reference / Antigravity 2.0発表)が404になっていないかブラウザで開いて確認

---

## 2. Harness Engineering(6分)★実際に手を動かす

```bash
cd samples/common-web
mkdir -p .claude
```

`.claude/settings.json` を作成し、`materials/02-harness-engineering.md` のPostToolUse hookをそのまま貼る。

- [ ] Claude Code で `samples/common-web` を開き、適当なファイルを1つ編集させる
- [ ] `.claude/harness.log` に1行追記されることを確認
- [ ] 権限スコープ例(過剰権限 → 絞り込み版)をコピペできる状態か確認

```bash
cat .claude/harness.log   # 記録されていればOK
rm .claude/settings.json .claude/harness.log   # リハーサル用の変更だけ削除(.claude/skills/ は残す。rm -rf .claude はスキル配布物ごと消えるので厳禁)
```

---

## 3. Artifacts + Design(3分)

- [ ] `materials/assets/dashboard-before-edit.html` と `dashboard-after-edit.html` をブラウザで開き、並べて見比べる
- [ ] 両方ともライト/ダーク切り替え(OS設定変更 or ブラウザのdevtoolsでシミュレート)で崩れないか確認

---

## 4. Self-host(ローカルLLM)(2分)★実際に手を動かす

- [ ] `ollama list` で `qwen2.5:1.5b` がダウンロード済みか確認
- [ ] `ollama serve` が起動しているか確認(`curl http://localhost:11434/api/tags` で応答が返るか)
- [ ] `materials/04-self-host-aws.md` の Step 2 の curl コマンドをそのまま叩いて、応答が返ることを確認
- [ ] Wi-Fiをオフにして同じcurlを叩き、応答が変わらず返ることを確認(本番前に一度は必ずやる)

---

## 5. Log Engineering(5分)★実際に手を動かす

アプリのソースは触らない。`.claude/settings.json` のhookコマンドだけ差し替える。

```bash
cd samples/common-web
cp exercises/log-settings/after.json .claude/settings.json
```

Claude Codeでファイルを2つ連続で編集させ(Edit/Writeどちらでも可)、`.claude/harness.log` を確認:

```bash
cat .claude/harness.log
```

- [ ] 1件目は `duration_ms: null`(直前ログが無い)
- [ ] 2件目以降は `duration_ms` に実際の間隔(ミリ秒)が入っている
- [ ] `request_id` が呼び出しごとに異なる値(`tool_use_id`)になっている

```bash
rm .claude/settings.json .claude/harness.log   # リハーサル用の変更を元に戻す
```

---

## 6. Graph Engineering(5分)

Workflowツールを使ったことがない/今すぐ実行すると時間を食う場合は、コードを読むだけでも可。

- [ ] `materials/06-graph-engineering.md` のbarrier版・pipeline版のコードを読み、違いを人に説明できるか自分で声に出す
- [ ] 余裕があれば実際に一度 `pipeline()` 版を実行し、進捗表示でステージが重なって進むことを確認

---

## 7. Security(4分)★実際に確認する

```bash
grep -n "changeme123" samples/common-web/routes/tasks.js
```

- [ ] 仕込んである弱いフォールバック(`"changeme123"`)が今も存在することを確認(✅ 確認済み: 2026-10-03時点で存在)
- [ ] `samples/common-web/INSTRUCTOR_NOTES.md` の仕掛け一覧(1〜4)を読み返し、`/security-review` で拾われなかった場合の誘導質問を思い出す
- [ ] `handouts/security-checklist.md` を自分のMCPサーバー/skillに1つ当てはめてみる(説明の練習)

---

## 8. Claude Cowork(1分)

- [ ] 自分のアカウントでCoworkが使えるプランか再確認
- [ ] `handouts/cowork-homework.md` の内容を1分で読み上げられるか確認

---

## 9. まとめ(1分)

- [ ] `materials/09-wrap-up.md` の「今日通した1本の線」を自分の言葉で30秒で言えるか練習

---

## リハーサル後にやること

- [ ] リハーサルで変更したファイル(`routes/tasks.js`、`.claude/`)が元に戻っているか `git status` で確認
- [ ] 気づいた詰まりポイントをこのファイルの下に追記していく(本番用の個人メモとして育てる)

## 気づいたこと(自由記入欄)

-
