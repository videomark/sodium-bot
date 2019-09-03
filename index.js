const { WebDriver } = require("selenium-webdriver");
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
    return await this.player.play({ driver, url });
  }

  async stop() {
    return await this.driver.get("about:blank");
  }
}

module.exports = { Page };
