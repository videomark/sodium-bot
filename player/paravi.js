const { WebDriver } = require("selenium-webdriver");

class ParaviPlayer {
  /**
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    return await driver.get(url);
  }
}

module.exports = { ParaviPlayer };
