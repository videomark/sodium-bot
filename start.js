const arg = require("arg");
const assert = require("assert");
const { Session } = require("selenium-webdriver");
const Symbols = require("selenium-webdriver/lib/symbols");
const { HttpClient, Executor } = require("selenium-webdriver/http");
const { Driver, Options } = require("selenium-webdriver/chrome");
const { Page } = require("./");

const { SELENIUM_REMOTE_URL } = process.env;
Object.entries({ SELENIUM_REMOTE_URL }).forEach(([env, value]) => {
  assert(value != null, `${env} required.`);
});

/**
 * @param {URL} url
 * @param {Number} timeout timeout period (seconds)
 */
const play = async (url, timeout) => {
  const client = new HttpClient(SELENIUM_REMOTE_URL);
  const executor = new Executor(client);

  executor.w3c = true;
  executor.defineCommand(
    "sendDevToolsCommand",
    "POST",
    "/session/:sessionId/chromium/send_command"
  );

  const driver = new Driver(require("./session.json"), executor);
  const page = new Page({ driver, url });

  page.play();

  await driver.sleep(timeout * 1e3);
  await page.stop();
};

const start = () => {
  const args = arg({
    "-h": "--help",
    "--help": Boolean,
    "-t": "--timeout",
    "--timeout": Number
  });
  const help = args["--help"];
  const timeout = args["--timeout"];

  if (help || !Number.isFinite(timeout)) {
    const { basename } = require("path");
    console.log(
      `Usage: ${process.argv0} ${basename(__filename)} [options] url`
    );
    console.log("Options:");
    console.log(
      [
        "-h, --help              print command line options",
        "-t, --timeout=...       set timeout period (seconds)"
      ].join("\n")
    );
    return;
  }

  play(new URL(args._[0]), timeout);
};

if (require.main === module) start();
