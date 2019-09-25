import { promises as fs } from "fs";
import { strict as assert } from "assert";
import { Driver } from "selenium-webdriver/chrome";
import Executor from "./utils/executor";
import logger from "./utils/logger";

const { readFile, unlink } = fs;

const { SELENIUM_REMOTE_URL } = process.env;
Object.entries({ SELENIUM_REMOTE_URL }).forEach(([env, value]) => {
  assert(value != null, `${env} required.`);
});

const down = async () => {
  const executor = new Executor(SELENIUM_REMOTE_URL);
  const session = JSON.parse((await readFile("./session.json")).toString());
  new Driver(session, executor).quit();
  await unlink("./session.json");
  logger.info("Quit session.");
};

if (require.main === module) down();
