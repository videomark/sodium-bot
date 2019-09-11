const { By } = require("selenium-webdriver");
const Player = require("./player");

class YouTubePlayer extends Player {
  /**
   * @override
   * @param {Number} ms timeout
   */
  async waitForPlaying(ms) {
    const { driver } = this;

    await Promise.all([
      driver
        .findElement(By.css("button.ytp-ad-survey-interstitial-action-button"))
        .then(el => el.click())
        .catch(() => {})
        .then(() => driver.findElement(By.css("button.ytp-ad-skip-button")))
        .then(el => el.click())
        .catch(() => {}),
      super.waitForPlaying(ms)
    ]);
  }
}

module.exports = { YouTubePlayer };
