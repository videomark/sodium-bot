# Ansible による Sodium Bot 構築

## これはなに

自動計測マシンの構成を管理するためのディレクトリ

## 計測用マシンを追加する方法

まず、Playbook とその設定ファイル (host_vars) を作成

例: webdino-jetson-1.photo.webdino.org.yml, host_vars/webdino-jetson-1.photo.webdino.org.yml

次に、操作対象のマシンに SSH で接続できる環境の操作者のマシンに Ansible をインストール

参考文献: [公式のインストールガイド](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

SSH 接続設定例:

```config
# ~/.ssh/config
Host webdino-jetson-1.photo.webdino.org
Hostname 10.10.10.211
User jetson
```

続いて、セットアップするために下記のようにコマンドを実行

例:

```sh
ansible-playbook -u jetson -i webdino-jetson-1.photo.webdino.org, webdino-jetson-1.photo.webdino.org.yml
```

このコマンドを実行すると、webdino-jetson-1.photo.webdino.org.pub が得られる

最後に、autossh のトンネル用ホスト (デフォルトでは tunnel@photo.webdino.org) の ~/.ssh/authorized_keys に、得られた webdino-jetson-1.photo.webdino.org.pub の中身を追記

### リモートで接続する方法

事前に上述の登録のための設定を済ませた場合、トンネル用ホストからそれぞれの自動計測マシンへ指定したポートで SSH 接続可能。
それぞれの自動計測マシンのポートは host_vars 以下のディレクトリにあるそれぞれの YAML ファイルの autossh_tunnel_port プロパティを参照。

たとえば手元のマシンからトンネル用のホストを介して webdino-jetson-1.photo.webdino.org に接続する場合、次のような設定を ~/.ssh/config ファイルに追記。

webdino-jetson-1.photo.webdino.org に接続する場合の例:

```config
Host webdino-jetson-1.photo.webdino.org
User jetson
ProxyCommand ssh -W localhost:12221 tunnel@photo.webdino.org
```

コマンド:

```sh
ssh webdino-jetson-1.photo.webdino.org
```

### Jetson Nano を計測用マシンとして追加する際の補足

Jetson Nano Developer Kit の SD カードイメージを書き込み後、初回起動時にいくつか画面上で設定するためのウィンドウが出てくるので適宜設定する必要がある

Jetson Nano Developer Kit の SD カードイメージにはあらかじめ Chromium がインストールされているが、Ansible によってインストールされる ChromeDriver との互換性のないバージョンの場合があるため、適宜 ChromeDriver に合わせてバージョンアップする必要がある

長期間放置する場合、自動セキュリティ更新をするために unattended-upgrades パッケージをインストールし設定しておくのが望ましい

## ディレクトリ構成

```
ansible
├── README.md     ... このファイル
├── group_vars
│   └── all.yml  ... 全体の共通設定
├── host_vars     ... それぞれのホストの設定
│   ├── webdino-jetson-1.photo.webdino.org.yml  ... ホストの設定
│   └── …
├── roles ... Ansible Roles
├── webdino-jetson-1.photo.webdino.org.pub  ... 公開鍵
├── webdino-jetson-1.photo.webdino.org.yml  ... ホストの構成 (Ansible Playbooks)
…
```
