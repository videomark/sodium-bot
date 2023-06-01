ARG from=docker.io/videomark/chrome:latest@sha256:a51461a8a122764584780f9013616f4af84c38780fb77bd176486cb6c512eb67
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
