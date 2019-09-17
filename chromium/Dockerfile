FROM ubuntu:19.04
RUN \
  apt-get update \
  && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y \
    tzdata \
    fonts-noto-cjk \
    chromium-browser \
    chromium-chromedriver \
    xvfb \
    curl \
    unzip \
  && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && rm -r /var/lib/apt/lists
ARG extension_url=https://sodium-extension.netlify.com/
RUN \
  curl \
    -sL "${extension_url}" \
    -o dist.zip \
  && mkdir videomark-extension \
  && unzip dist.zip -d videomark-extension \
  && rm dist.zip
CMD xvfb-run chromedriver --whitelisted-ips="" --port="${PORT:-9515}"
