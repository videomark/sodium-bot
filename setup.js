const arg = require("arg");
const assert = require("assert").strict;
const { writeFile } = require("fs").promises;
const { WebDriver, Builder, By } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const isTermsPage = require("./utils/isTermsPage");
const isWelcomePage = require("./utils/isWelcomePage");
const isSettingsPage = require("./utils/isSettingsPage");
const logger = require("./utils/logger");

const { VIDEOMARK_EXTENSION_PATH, SESSION_ID } = process.env;
Object.entries({ VIDEOMARK_EXTENSION_PATH, SESSION_ID }).forEach(
  ([env, value]) => {
    assert(value != null, `${env} required.`);
  }
);

/**
 * @param {WebDriver} driver
 */
const click = driver => cssselector =>
  driver.findElement(By.css(cssselector)).click();

/**
 * @param {WebDriver} driver
 */
const closeOthers = async driver => {
  const current = await driver.getWindowHandle();
  const others = (await driver.getAllWindowHandles()).filter(
    other => other !== current
  );

  for (const other of others) {
    await driver.switchTo().window(other);
    await driver.close();
  }

  await driver.switchTo().window(current);
};

/**
 * @param {WebDriver} driver
 */
const waitForContentRendering = async driver => {
  await driver.wait(driver =>
    driver.executeScript(`return document.readyState === "complete"`)
  );
  await driver.sleep(300);
};

/**
 * @return {Promise<WebDriver>}
 */
const build = async () => {
  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(
      new Options()
        .addArguments(
          "--no-sandbox",
          "--disable-dev-shm-usage",
          `--load-extension=${VIDEOMARK_EXTENSION_PATH}`,
          // NOTE: for Paravi.
          "--autoplay-policy=no-user-gesture-required"
        )
        .excludeSwitches(
          // NOTE: for Paravi.
          "--disable-background-networking",
          // NOTE: for Paravi.
          "--disable-default-apps"
        )
    )
    .build();

  await writeFile(
    "session.json",
    JSON.stringify((await driver.getSession()).getId())
  );
  logger.info("Save WebDriver session file.");

  // NOTE: wait for terms page to open.
  await driver.sleep(500);

  return driver;
};

const setup = async () => {
  const args = arg({
    "-h": "--help",
    "--help": Boolean,
    "--session-id": String
  });
  const help = args["--help"];
  const sessionId =
    args["--session-id"] != null ? args["--session-id"] : SESSION_ID;

  if (help) {
    const { basename } = require("path");
    console.log(
      [
        `Usage: ${process.argv0} ${basename(__filename)} [options]`,
        "Options:",
        "-h, --help              print command line options",
        "--session-id=...        set session id"
      ].join("\n")
    );
    return;
  }

  let driver;
  try {
    driver = await build();

    const windows = await driver.getAllWindowHandles();
    const urls = [];
    for (const windowName of windows) {
      await driver.switchTo().window(windowName);
      urls.push({
        windowName,
        url: new URL(await driver.getCurrentUrl())
      });
    }
    const terms = urls.find(({ url }) => isTermsPage(url));
    assert(terms != null, "Terms page is not found.");

    await driver.switchTo().window(terms.windowName);
    await closeOthers(driver);
    await waitForContentRendering(driver);

    ["#terms", "#privacy", "#submit"].forEach(click(driver));
    await waitForContentRendering(driver);

    // NOTE: wait for welcome page to open.
    await driver.sleep(1e3);

    const url = new URL(await driver.getCurrentUrl());
    assert(isWelcomePage(url), "Welcome page has not been opened.");

    await driver.get(
      new URL(
        `#/settings?${new URLSearchParams({
          session_id: sessionId
        })}`,
        url
      )
    );
    assert(
      isSettingsPage(new URL(await driver.getCurrentUrl())),
      "Settings page has not been opened."
    );

    assert.equal(
      await driver
        .findElement(
          By.xpath(`//*[text()="セッションID"]/following-sibling::*`)
        )
        .getText(),
      sessionId,
      "Failed to set Session ID."
    );

    logger.info(`Session ID: ${sessionId}`);
    logger.info("Setup complete.");
  } catch (error) {
    if (driver != null) {
      logger.error(`Current URL: ${await driver.getCurrentUrl()}`);
      driver.quit();
    }
    throw error;
  }
};

if (require.main === module) setup();
