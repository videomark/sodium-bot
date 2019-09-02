const { unlink } = require("fs").promises;
const assert = require("assert");
const { HttpClient, Executor } = require("selenium-webdriver/http");
const { Driver } = require("selenium-webdriver/chrome");

const { SELENIUM_REMOTE_URL } = process.env;
Object.entries({ SELENIUM_REMOTE_URL }).forEach(([env, value]) => {
  assert(value != null, `${env} required.`);
});

const down = async () => {
  const client = new HttpClient(SELENIUM_REMOTE_URL);
  const executor = new Executor(client);

  new Driver(require("./session.json"), executor).quit();
  await unlink("./session.json");
  console.log("Quit session.");
};

if (require.main === module) down();
