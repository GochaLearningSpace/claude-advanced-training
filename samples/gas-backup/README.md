# MiniTask(GAS版・予備サンプル)

`samples/common-web` の予備。基本のハンズオンは common-web で統一しているが、GAS に馴染みのある受講者向けに同等機能を用意している。

## セットアップ

```bash
cd samples/gas-backup
clasp create --type webapp --title "MiniTask (GAS)"
clasp push
clasp deploy
```

デプロイ後、Web App の URL に対して:
- `GET <URL>` でタスク一覧
- `POST <URL>` に `{"action":"create","title":"..."}` でタスク追加
- `POST <URL>` に `{"action":"delete","id":1,"adminKey":"..."}` でタスク削除(要 Script Properties の `ADMIN_KEY` 設定)

## 注意

Web App としてデプロイした場合、`Logger.log` の内容はエディタの実行ログには出ない(外部からの呼び出しのため)。Stackdriver Logging(Cloud Logging)側で確認するか、シートベースのログに切り替える必要がある — これは Log Engineering セクションで扱う内容そのもの。
