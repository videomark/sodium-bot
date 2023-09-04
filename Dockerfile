ARG from=docker.io/videomark/chrome:latest@sha256:6727b920621c8913ca520b187c30f4a9b0a75339222da7cef6089240e673e52a
FROM ${from}

# Install Node.js LTS.
RUN \
  curl -sL https://deb.nodesource.com/setup_18.x \
  | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -r /var/lib/apt/lists

# Setup Desktop.
ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=Asia/Tokyo
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  jwm \
  novnc \
  supervisor \
  x11vnc \
  xterm \
  && rm -r /var/lib/apt/lists \
  && ln -s vnc.html /usr/share/novnc/index.html

# Setup Sodium Bot.
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Setup Entrypoint.
COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
ENV DISPLAY=:0
ENV SESSION_ID=sodium
EXPOSE 8080
COPY supervisord.conf /etc/supervisor/supervisord.conf
CMD ["supervisord"]
