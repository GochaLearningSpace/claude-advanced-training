# MiniTask — Claude アドバンストトレーニング ハンズオンサンプル

Claude アドバンストトレーニングで使う共通ハンズオンサンプル。

## どちらを使うか

- **`common-web/`**: メインで使う(Node.js/Express)。基本はこちら
- **`gas-backup/`**: Google Apps Script に馴染みがある人向けの予備。機能は common-web と同等

## セットアップ(common-web)

```bash
cd common-web
npm install
cp .env.example .env
npm start
```

`http://localhost:3000` を開いて、タスクの追加・完了チェックができれば準備完了。

## セットアップ(gas-backup)

```bash
cd gas-backup
clasp create --type webapp --title "MiniTask (GAS)"
clasp push
clasp deploy
```

詳細は各フォルダの README.md を参照。

---

> このファイルは `ClaudeTraining/samples/README.md` が原本。`scripts/publish-samples.sh` を実行すると
> 公開用リポジトリ(minitask-handson)のトップ README として自動的にコピーされる。直接 minitask-handson 側を編集しないこと。
