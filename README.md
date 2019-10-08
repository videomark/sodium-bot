# Sodium Bot

動画配信サービスの視聴品質の自動計測

## 使い方

カレントディレクトリに [botconfig.json](botconfig.json) を配置し、計測を開始する。

### botconfig.json

デフォルトで読み込まれる再生する動画の一覧 (playlist) を記載した JSON ファイル。

playlist:
次の Video オブジェクトの配列

Video オブジェクト:

```ts
interface Video {
  url: string;
  timeout: number;
}
```

| プロパティ | 説明                  |
| ---------- | --------------------- |
| url        | 測定対象の動画の URL  |
| timeout    | 測定し続ける時間 (秒) |

### 計測の始め方

```sh
docker-compose run --rm bot setup --session-id sodium
docker-compose run --rm bot start
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

あらかじめ Chromium と ChromeDriver をインストールする。
加えて、VideoMark Extension をダウンロードする。

#### Chromium のインストール

Ubuntu:

```sh
sudo apt-get install -y chromium-browser
```

Debian:

```sh
sudo apt-get install -y chromium
```

#### ChromeDriver のインストール

```sh
curl \
  -sL https://github.com/electron/electron/releases/download/v6.0.11/chromedriver-v6.0.11-linux-arm64.zip \
  -o chromedriver.zip
sudo unzip -q chromedriver.zip -d /usr/local/bin
sudo chmod +x /usr/local/bin/chromedriver
rm chromedriver.zip
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
npm run setup -- --session-id sodium
npm start
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
npm start
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
