FROM ubuntu:19.04
RUN \
  apt-get update \
  && apt-get install -y \
    fonts-noto-cjk \
    chromium-browser \
    chromium-chromedriver \
    xvfb \
    curl \
    unzip \
  && rm -r /var/lib/apt/lists
RUN \
  curl \
    -sL https://sodium-extension.netlify.com/ \
    -o dist.zip \
  && mkdir videomark-extension \
  && unzip dist.zip -d videomark-extension \
  && rm dist.zip
CMD xvfb-run chromedriver --whitelisted-ips="" --port="${PORT:-9515}"
