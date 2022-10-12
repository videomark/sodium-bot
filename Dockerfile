ARG from=docker.io/videomark/chrome:latest
FROM ${from}

# Install Node.js LTS.
RUN \
  curl -sL https://deb.nodesource.com/setup_lts.x \
  | bash - \
  && apt-get install -qq nodejs \
  && rm -r /var/lib/apt/lists

# Setup Sodium Bot.
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG session_id=sodium
ENV SESSION_ID=${session_id}
ENTRYPOINT ["/bin/sh", "-c", "xvfb-run --server-args='-screen 0 1920x1080x24' npm run -- \"$@\"", ""]
CMD ["start"]
