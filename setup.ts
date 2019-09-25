import * as arg from "arg";
import { strict as assert } from "assert";
import { promises as fs } from "fs";
import { WebDriver, Builder, By } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import isTermsPage from "./utils/isTermsPage";
import isWelcomePage from "./utils/isWelcomePage";
import isSettingsPage from "./utils/isSettingsPage";
import logger from "./utils/logger";

const { writeFile } = fs;
const { VIDEOMARK_EXTENSION_PATH, SESSION_ID } = process.env;

const click = (driver: WebDriver) => (cssselector: string) =>
  driver.findElement(By.css(cssselector)).click();

const closeOthers = async (driver: WebDriver) => {
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

const waitForContentRendering = async (driver: WebDriver) => {
  await driver.wait((driver: WebDriver) =>
    driver.executeScript(`return document.readyState === "complete"`)
  );
  await driver.sleep(300);
};

const build = async () => {
  if (VIDEOMARK_EXTENSION_PATH == null) {
    throw new Error("VIDEOMARK_EXTENSION_PATH required.");
  }

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

  if (sessionId == null) {
    throw new Error("SESSION_ID or --session-id=... required.");
  }

  if (help) {
    const { basename } = await import("path");
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
