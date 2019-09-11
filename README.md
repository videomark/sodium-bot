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
docker-compose up --build -d
docker-compose run --rm bot start -- -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
docker-compose down
```
