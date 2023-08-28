FROM ubuntu:22.04@sha256:dfd64a3b4296d8c9b62aa3309984f8620b98d87e47492599ee20739e8eb54fbf
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
  && CHROME_DRIVER_VERSION=$(curl -sSfL "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_MAJOR_VERSION}") \
  && curl \
  -sSfL "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/${CHROME_DRIVER_VERSION}/linux64/chromedriver-linux64.zip" \
  -o chromedriver.zip \
  && unzip chromedriver.zip chromedriver-linux64/chromedriver \
  && install chromedriver-linux64/chromedriver /usr/local/bin/ \
  && rm -r chromedriver.zip chromedriver-linux64/
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
