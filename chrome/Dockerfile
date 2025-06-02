FROM node:22-bookworm
RUN \
  apt-get update -qq \
  && apt-get install -qq \
  curl \
  fonts-noto-cjk \
  unzip \
  xvfb \
  && rm -r /var/lib/apt/lists
RUN \
  npx -y playwright@latest install --with-deps chromium \
  && ln -sf /root/.cache/ms-playwright/chromium-*/*/chrome /usr/bin/google-chrome
RUN \
  CHROME_MAJOR_VERSION=$(google-chrome --version | sed -E "s/.* ([0-9]+)(\.[0-9]+){3}.*/\1/") \
  && CHROME_DRIVER_VERSION=$(curl -sSfL "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_MAJOR_VERSION}") \
  && curl \
  -sSfL "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_DRIVER_VERSION}/linux64/chromedriver-linux64.zip" \
  -o chromedriver.zip \
  && unzip chromedriver.zip chromedriver-linux64/chromedriver \
  && install chromedriver-linux64/chromedriver /usr/local/bin/ \
  && rm -r chromedriver.zip chromedriver-linux64/
ARG extension_url=https://sodium-extension.netlify.app/
ENV VIDEOMARK_EXTENSION_PATH=/videomark-extension
RUN \
  curl \
  -sL "${extension_url}" \
  -o dist.zip \
  && mkdir -p "${VIDEOMARK_EXTENSION_PATH}" \
  && unzip -q dist.zip -d "${VIDEOMARK_EXTENSION_PATH}" \
  && rm dist.zip
CMD xvfb-run chromedriver --whitelisted-ips="" --port="${PORT:-9515}"
