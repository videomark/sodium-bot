# Sodium Bot

動画配信サービスの視聴品質を自動計測し続けるやつ

## つかいかた

```sh
chromedriver --port=8008 &
export SELENIUM_REMOTE_URL=http://localhost:8008
VIDEOMARK_EXTENSION_PATH=/path/to/videomark-extension/ SESSION_ID=sodium node setup.js
node start.js -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
node down.js
```

### Docker コンテナを使う場合

```sh
dokcer-compose up -d
export SELENIUM_REMOTE_URL=http://localhost:8008
VIDEOMARK_EXTENSION_PATH=videomark-extension SESSION_ID=sodium node setup.js
node start.js -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
node down.js
```

## TODO

- [x] セッション ID の設定、ブラウザの起動
- [ ] 自動計測する計測スクリプトの実装
  - 任意の期間 (数分〜数時間)・対象の動画配信サービスの任意の URL の動画またはプレイリストを閲覧して再生し続けることができる
- [ ] 計測スクリプトを Docker コンテナ化
