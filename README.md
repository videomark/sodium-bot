# Sodium Bot

動画配信サービスの視聴品質の自動計測

## 使い方

カレントディレクトリに [botconfig.json](botconfig.json) を配置し、計測を開始する。

### botconfig.json

実行するタイミング (schedule) とデフォルトで読み込まれる再生する動画の一覧 (playlist) を記載した JSON ファイル。

schedule:
[cron のパターン](https://www.npmjs.com/package/cron#available-cron-patterns)の文字列

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
git clone https://github.com/videomark/sodium-bot.git
cd sodium-bot
docker run --rm -it -v "$PWD:/app" --shm-size 256M videomark/sodium-bot:latest start --session-id=sodium
```

### 自動計測マシンの場合

[Ansible による Sodium Bot 構築](ansible/README.md)を参照。

### Android 端末の場合

USB デバッグを有効化した後、ホスト側のパソコンと接続する。
加えて、あらかじめ VideoMark Browser を起動しておき、新しいタブを開いておく。

```sh
adb start-server
CHROMEDRIVER_VERSION=70.0.3538.97 npx --ignore-existing chromedriver --port=8080 &
export SELENIUM_REMOTE_URL=http://localhost:8080
export BROWSER=android
npm ci
npm start
```

## Docker Hub に公開する方法

[videomark ユーザー](https://hub.docker.com/u/videomark)のみデプロイ可能。
以下のコマンドを実行すると Docker Hub に公開される。

```sh
docker login
export VERSION=latest
docker-compose build
docker-compose push
```

## 動作環境

- Docker v19, Docker Compose v1.24 にて動作確認

### Android 端末

ホスト:

- adb v1.0.39
- node v12.10.0
- npm, npx v6.11.3

クライアント:

- VideoMark Browser v70.0.3538.124-7
