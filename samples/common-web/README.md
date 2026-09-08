# MiniTask

Claude アドバンストトレーニング用の共通ハンズオンサンプル。最小限のタスク管理 Web アプリ。

## セットアップ(事前課題、当日までに完了しておくこと)

```bash
git clone <このリポジトリのURL>
cd samples/common-web
npm install
cp .env.example .env
npm start
```

`http://localhost:3000` を開いてタスクの追加・完了チェックができれば準備完了。

## 構成

```
common-web/
├── server.js          Express エントリポイント
├── routes/tasks.js     タスクAPI(GET/POST/PUT/DELETE)
├── lib/store.js         JSONファイルへの永続化
├── data/tasks.json       シードデータ
├── public/                フロントエンド(素のHTML/CSS/JS、ビルド不要)
└── .env.example            環境変数サンプル
```

## 当日の使い方

このリポジトリは Harness Engineering / Artifacts & Design / Log Engineering / Graph Engineering / Security の各セクションで共通して使う。セクションが進むごとに機能を追加・改造していく想定。
