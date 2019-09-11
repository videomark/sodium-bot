FROM node:12-alpine
WORKDIR /app
COPY . .
RUN npm ci
ENTRYPOINT ["npm","run"]
CMD ["setup"]
