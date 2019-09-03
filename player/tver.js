const { WebDriver } = require("selenium-webdriver");

/**
 * @param {WebDriver} driver
 * @returns {Promise<Function>}
 */
const replaceUserAgent = async driver => {
  const userAgent = await driver.executeScript(
    "return window.navigator.userAgent"
  );

  // NOTE: can't play on linux user agent.
  if (!/X11; Linux x86_64/.test(userAgent)) {
    return async () => {};
  }

  // NOTE: can't play on linux user agent.
  await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
    userAgent: userAgent.replace(
      "X11; Linux x86_64",
      "Windows NT 10.0; Win64; x64"
    )
  });

  return async () => {
    await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
      userAgent
    });
  };
};

class TVerPlayer {
  /**
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    const onStop = await replaceUserAgent(driver);

    await driver.get(url);
    await driver.executeScript("closeEnquete()");

    await onStop();
  }
}

module.exports = { TVerPlayer };
