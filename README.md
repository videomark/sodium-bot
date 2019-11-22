[![Docker workflow status](https://github.com/videomark/sodium-bot/workflows/Docker/badge.svg)](https://github.com/videomark/sodium-bot/actions?query=workflow%3ADocker)

# Sodium Bot

動画配信サービスの視聴品質の自動計測

## 計測の始め方

```sh
docker run --rm -it --shm-size 256M videomark/sodium-bot start --session-id=sodium
```

または

```sh
git clone https://github.com/videomark/sodium-bot.git
cd sodium-bot
docker-compose run --rm sodium-bot start --session-id=sodium
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

## その他の使い方

### 特定の動画の再生

デフォルトの設定ファイル (botconfig.json) を用いず、ある特定の動画の計測を行う場合、次のようにコマンドを実行する。

```sh
docker run --rm -it --shm-size 256M videomark/sodium-bot start --session-id=sodium -t 180 https://www.youtube.com/watch?v=mY6sChi65oU
```

詳しいコマンドラインオプションのヘルプは次のコマンドの実行結果を参照。

```sh
docker run --rm videomark/sodium-bot start --help
```

### 設定ファイル (botconfig.json)

[botconfig.json](botconfig.json) は実行するタイミング (schedule) とデフォルトで読み込まれる再生する動画の一覧 (playlist) を記載した JSON ファイル。

書式は下記の通り。

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
