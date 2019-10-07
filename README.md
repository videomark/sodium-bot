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
docker-compose run --rm bot down
docker-compose down --volumes
```

### arm64 環境の場合

あらかじめ Chromium と Chromedriver をインストールする。
加えて、VideoMark Extension をダウンロードする。

#### Chromium と Chromedriver のインストール

Ubuntu:

```sh
sudo apt-get install -y chromium-browser chromium-chromedriver
```

Debian:

```sh
sudo apt-get install -y chromium chromium-driver
```

#### VideoMark Extension のダウンロード

```sh
curl \
    -sL https://sodium-extension.netlify.com/ \
    -o dist.zip \
  && mkdir videomark-extension \
  && unzip -q dist.zip -d videomark-extension \
  && rm dist.zip
export VIDEOMARK_EXTENSION_PATH=$PWD/videomark-extension
```

#### 計測の始め方

```sh
chromedriver --port=8080 &
export SELENIUM_REMOTE_URL=http://localhost:8080
npm ci
npm run setup
npm run start -- -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
npm run down
```

### Android 端末の場合

USB デバッグを有効化した後、ホスト側のパソコンと接続する。
加えて、あらかじめ VideoMark Browser を起動しておき、新しいタブを開いておく。

```sh
adb start-server
CHROMEDRIVER_VERSION=70.0.3538.97 npx --ignore-existing chromedriver --port=8080 &
export SELENIUM_REMOTE_URL=http://localhost:8080
npm ci
npm run setup -- --android
npm run start -- -t 60 https://www.youtube.com/watch?v=mY6sChi65oU
npm run down
```

## 動作環境

- Docker v19, Docker Compose v1.24 にて動作確認

### arm64 環境

ホスト:

- node v12.10.0
- npm v6.11.3

### Android 端末

ホスト:

- adb v1.0.39
- node v12.10.0
- npm, npx v6.11.3

クライアント:

- VideoMark Browser v70.0.3538.124-7
