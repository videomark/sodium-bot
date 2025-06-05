FROM node:22-bookworm

# Setup Desktop.
ARG TZ=Asia/Tokyo
RUN apt-get update \
  && apt-get install -y \
  fonts-noto-cjk \
  jwm \
  novnc \
  supervisor \
  unzip \
  x11vnc \
  xterm \
  xvfb \
  && rm -r /var/lib/apt/lists \
  && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && ln -s vnc.html /usr/share/novnc/index.html

# Install Browser.
RUN npx @puppeteer/browsers install chrome@stable --path=/root/.cache \
  && mkdir -p /opt/google/chrome \
  && ln -sf /root/.cache/chrome/*/chrome-*/chrome /opt/google/chrome/chrome

# Download VideoMark extension.
ARG VIDEOMARK_EXTENSION_URL=https://v3-2--sodium-extension.netlify.app/
ENV VIDEOMARK_EXTENSION_PATH=/videomark-extension
RUN \
  curl \
  -sL "${VIDEOMARK_EXTENSION_URL}" \
  -o dist.zip \
  && mkdir -p "${VIDEOMARK_EXTENSION_PATH}" \
  && unzip -q dist.zip -d "${VIDEOMARK_EXTENSION_PATH}" \
  && rm dist.zip

# Setup Sodium Bot.
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npx playwright install-deps chromium
COPY . .

# Setup Entrypoint.
COPY ./docker-entrypoint.sh ./docker-cleanup.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
ENV DISPLAY=:0
ENV SESSION_ID=sodium
EXPOSE 8080
COPY supervisord.conf /etc/supervisor/supervisord.conf
CMD ["supervisord"]
