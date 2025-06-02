ARG from=docker.io/videomark/chrome:latest@sha256:e85337a8dc23e5650579998f0e702de1b4388c1dbe31fa1e03e5934165277d30
FROM ${from}

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
  && ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && ln -s vnc.html /usr/share/novnc/index.html

# Setup Sodium Bot.
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Setup Entrypoint.
COPY ./docker-entrypoint.sh ./docker-cleanup.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
ENV DISPLAY=:0
ENV SESSION_ID=sodium
EXPOSE 8080
COPY supervisord.conf /etc/supervisor/supervisord.conf
CMD ["supervisord"]
