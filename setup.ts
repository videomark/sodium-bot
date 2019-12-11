import { strict as assert } from "assert";
import { WebDriver, Builder, By, Capabilities } from "selenium-webdriver";
import { saveSession } from "./utils/session";
import isTermsPage from "./utils/isTermsPage";
import isWelcomePage from "./utils/isWelcomePage";
import isSettingsPage from "./utils/isSettingsPage";
import logger from "./utils/logger";

const { SELENIUM_REMOTE_URL, VIDEOMARK_EXTENSION_PATH } = process.env;

const waitForContentRendering = async (driver: WebDriver) => {
  await driver.wait((driver: WebDriver) =>
    driver.executeScript(`return document.readyState === "complete"`)
  );
  await driver.sleep(300);
};

const click = (driver: WebDriver) => (cssselector: string) =>
  driver.findElement(By.css(cssselector)).click();

const switchToTermsPage = async (driver: WebDriver) => {
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
  if (terms == null) throw new Error("Terms page is not found.");

  await driver.switchTo().window(terms.windowName);
  await waitForContentRendering(driver);
};

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

const agreeToTerms = async (driver: WebDriver) => {
  await switchToTermsPage(driver);
  await closeOthers(driver);

  ["#terms", "#privacy", "#submit"].forEach(click(driver));
  await waitForContentRendering(driver);

  // NOTE: wait for welcome page to open.
  await driver.sleep(10e3);

  const url = new URL(await driver.getCurrentUrl());
  assert(isWelcomePage(url), "Welcome page has not been opened.");

  return url;
};

const setSessionId = async (driver: WebDriver, sessionId: string) => {
  const url = await driver.getCurrentUrl();
  await driver.get(
    new URL(
      `#/settings?${new URLSearchParams({
        session_id: sessionId
      })}`,
      url
    ).toString()
  );
  assert(
    isSettingsPage(new URL(await driver.getCurrentUrl())),
    "Settings page has not been opened."
  );

  assert.equal(
    await driver
      .findElement(By.xpath(`//*[text()="セッションID"]/following-sibling::*`))
      .getText(),
    sessionId,
    "Failed to set Session ID."
  );
};

const build = async (
  browser: string,
  options?: { androidDeviceSerial?: string }
) => {
  let capabilities: Capabilities | {} = {};
  switch (browser) {
    case "chrome": {
      if (VIDEOMARK_EXTENSION_PATH == null) {
        throw new Error("VIDEOMARK_EXTENSION_PATH required.");
      }
      capabilities = Capabilities.chrome().set("goog:chromeOptions", {
        args: [
          "--no-sandbox",
          `--load-extension=${VIDEOMARK_EXTENSION_PATH}`,
          // NOTE: for Paravi.
          "--autoplay-policy=no-user-gesture-required"
        ],
        excludeSwitches: [
          // NOTE: for Paravi.
          "--disable-background-networking",
          // NOTE: for Paravi.
          "--disable-default-apps"
        ]
      });
      break;
    }
    case "android": {
      const { androidDeviceSerial } = options || {};
      capabilities = Capabilities.chrome().set("goog:chromeOptions", {
        androidExecName: "chrome",
        androidDeviceSocket: "chrome_devtools_remote",
        androidPackage: "org.webdino.videomarkbrowser",
        androidUseRunningApp: true,
        ...(androidDeviceSerial == null ? {} : { androidDeviceSerial })
      });
      break;
    }
  }

  const driver = new Builder().withCapabilities(capabilities).build();

  if (SELENIUM_REMOTE_URL) {
    await saveSession(driver);
    logger.info("Save WebDriver session file.");
  }

  return driver;
};

export const setup = async (
  browser: string = "chrome",
  options?: { sessionId?: string; androidDeviceSerial?: string }
) => {
  let driver;
  try {
    driver = await build(browser, options);
    switch (browser) {
      case "chrome": {
        logger.info("Wait for warm up...");
        await driver.sleep(10e3);

        logger.info("Agree to terms.");
        await agreeToTerms(driver);
        break;
      }
      case "android": {
        logger.info("Settings page is not yet supported.");
        break;
      }
    }

    const { sessionId } = options || {};
    if (sessionId != null) {
      await setSessionId(driver, sessionId);
      logger.info(`Session ID: ${sessionId}`);
    }

    logger.info("Setup complete.");
  } catch (error) {
    if (driver != null) {
      logger.error(`Current URL: ${await driver.getCurrentUrl()}`);
      driver.quit();
    }
    throw error;
  }

  return driver;
};
