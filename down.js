const { unlink } = require("fs").promises;
const assert = require("assert");
const { Driver } = require("selenium-webdriver/chrome");
const Executor = require("./utils/executor");
const logger = require("./utils/logger");

const { SELENIUM_REMOTE_URL } = process.env;
Object.entries({ SELENIUM_REMOTE_URL }).forEach(([env, value]) => {
  assert(value != null, `${env} required.`);
});

const down = async () => {
  const executor = new Executor(SELENIUM_REMOTE_URL);
  new Driver(require("./session.json"), executor).quit();
  await unlink("./session.json");
  logger.info("Quit session.");
};

if (require.main === module) down();
