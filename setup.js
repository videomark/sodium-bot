const assert = require("assert").strict;
const { writeFile } = require("fs").promises;
const { WebDriver, Builder, By } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const isTermsPage = require("./utils/isTermsPage");
const isWelcomePage = require("./utils/isWelcomePage");
const isSettingsPage = require("./utils/isSettingsPage");

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
      new Options().addArguments(
        "--no-sandbox",
        `--load-extension=${VIDEOMARK_EXTENSION_PATH}`
      )
    )
    .build();

  await writeFile(
    "session.json",
    JSON.stringify((await driver.getSession()).getId())
  );
  console.log("Save WebDriver session file.");

  // NOTE: wait for terms page to open.
  await driver.sleep(500);

  return driver;
};

const setup = async () => {
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
          session_id: SESSION_ID
        })}`,
        url
      )
    );
    assert(
      isSettingsPage(new URL(await driver.getCurrentUrl())),
      "Settings page has not been opened."
    );

    const sessionId = await driver
      .findElement(By.xpath(`//*[text()="セッションID"]/following-sibling::*`))
      .getText();

    assert(sessionId === SESSION_ID, "Failed to set Session ID.");

    console.log(`Session ID: ${SESSION_ID}`);
    console.log("Setup complete.");
  } catch (error) {
    if (driver != null) {
      console.error(`Current URL: ${await driver.getCurrentUrl()}`);
      driver.quit();
    }
    throw error;
  }
};

setup();
