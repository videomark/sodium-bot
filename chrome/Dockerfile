FROM ubuntu:22.04@sha256:7cfe75438fc77c9d7235ae502bf229b15ca86647ac01c844b272b56326d56184
RUN \
  apt-get update -qq \
  && DEBIAN_FRONTEND=noninteractive \
    apt-get install -qq \
    curl \
    gnupg2 \
    tzdata \
    fonts-noto-cjk \
    xvfb \
    unzip \
  && curl -sL https://dl.google.com/linux/linux_signing_key.pub \
    | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qq \
  && apt-get install -qq google-chrome-stable \
  && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && rm -r /var/lib/apt/lists
RUN \
  CHROME_MAJOR_VERSION=$(google-chrome --version | sed -E "s/.* ([0-9]+)(\.[0-9]+){3}.*/\1/") \
  && CHROME_DRIVER_VERSION=$(curl -sL "https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${CHROME_MAJOR_VERSION}") \
  && curl \
    -sL "https://chromedriver.storage.googleapis.com/${CHROME_DRIVER_VERSION}/chromedriver_linux64.zip" \
    -o chromedriver.zip \
  && unzip -q chromedriver.zip -d /usr/local/bin \
  && chmod +x /usr/local/bin/chromedriver \
  && rm chromedriver.zip
ARG extension_url=https://sodium-extension.netlify.com/
ENV VIDEOMARK_EXTENSION_PATH=/videomark-extension
RUN \
  curl \
    -sL "${extension_url}" \
    -o dist.zip \
  && mkdir -p "${VIDEOMARK_EXTENSION_PATH}" \
  && unzip -q dist.zip -d "${VIDEOMARK_EXTENSION_PATH}" \
  && rm dist.zip
CMD xvfb-run chromedriver --whitelisted-ips="" --port="${PORT:-9515}"
