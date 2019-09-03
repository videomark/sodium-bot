const { WebDriver } = require("selenium-webdriver");

class YouTubePlayer {
  /**
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    return await driver.get(url);
  }
}

module.exports = { YouTubePlayer };
