const { WebDriver, By } = require("selenium-webdriver");
const Player = require("./player");

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

class TVerPlayer extends Player {
  /**
   * @override
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    this.onStop = await replaceUserAgent(driver);

    await super.play({ driver, url });
    await driver.executeScript("return closeEnquete()");
  }

  /**
   * @override
   * @param {Number} ms timeout
   */
  async waitForPlaying(ms) {
    const { driver } = this;

    await Promise.all([
      driver
        .findElement(By.xpath(`//a[text()="最初から再生する"]`))
        .then(el => el.click())
        .catch(() => {}),
      super.waitForPlaying(ms)
    ]);
  }
}

module.exports = { TVerPlayer };
