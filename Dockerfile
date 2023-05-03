ARG from=docker.io/videomark/chrome:latest@sha256:c691cb859f743aa245fa5d4b14296840db61f944949dc76edfd5d2ccb6de9ccb
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
