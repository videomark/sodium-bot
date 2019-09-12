const { By } = require("selenium-webdriver");
const Player = require("./player");

class YouTubePlayer extends Player {
  /**
   * @override
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    await super.play({ driver, url });
    await driver
      .findElement(By.css("button.ytp-ad-survey-interstitial-action-button"))
      .then(el => el.click())
      .catch(() => {});
    await driver
      .findElement(By.css("button.ytp-ad-skip-button"))
      .then(el => el.click())
      .catch(() => {});
  }
}

module.exports = { YouTubePlayer };
