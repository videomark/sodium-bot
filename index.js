const { WebDriver, until, By } = require("selenium-webdriver");
const { YouTubePlayer } = require("./player/youtube");
const { ParaviPlayer } = require("./player/paravi");
const { TVerPlayer } = require("./player/tver");
const isYouTubePage = require("./utils/isYouTubePage");
const isParaviPage = require("./utils/isParaviPage");
const isTVerPage = require("./utils/isTVerPage");

class Page {
  /**
   * @param {{driver: WebDriver, url: URL}} options
   */
  constructor({ driver, url }) {
    Object.assign(this, {
      driver,
      url
    });
    if (isYouTubePage(url)) {
      this.player = new YouTubePlayer();
      return;
    }
    if (isParaviPage(url)) {
      this.player = new ParaviPlayer();
      return;
    }
    if (isTVerPage(url)) {
      this.player = new TVerPlayer();
      return;
    }
    throw new Error("Not supported URL.");
  }

  async play() {
    const { driver, url } = this;
    await this.player.play({ driver, url });
  }

  async stop() {
    await this.player.stop("about:blank");
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForSodiumExists(ms) {
    const { driver } = this;

    await driver.wait(
      until.elementsLocated(By.css(`script[src^="chrome"][src$="/sodium.js"]`)),
      ms,
      "Sodium.js not found."
    );
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForPlaying(ms) {
    const { player } = this;

    await player.waitForPlaying(ms);
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForShowStatus(ms) {
    const { player } = this;

    await player.waitForShowStatus(ms);
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForShowQuality(ms) {
    const { player } = this;

    await player.waitForShowQuality(ms);
  }
}

module.exports = { Page };
