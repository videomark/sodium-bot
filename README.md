# Sodium Bot

動画配信サービスの視聴品質の自動計測

## 使い方

### 計測の始め方

```sh
docker-compose run --rm bot setup --session-id sodium
docker-compose run --rm bot start -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
```

### 構築

```sh
docker-compose up --build -d
```

### 撤去

```sh
docker-compose down --volumes
```

## 動作環境

- Docker v19, Docker Compose v1.24 にて動作確認
