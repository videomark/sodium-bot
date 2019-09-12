const { WebDriver, until, By } = require("selenium-webdriver");
const Fluture = require("fluture");
const { YouTubePlayer } = require("./player/youtube");
const { ParaviPlayer } = require("./player/paravi");
const { TVerPlayer } = require("./player/tver");
const isYouTubePage = require("./utils/isYouTubePage");
const isParaviPage = require("./utils/isParaviPage");
const isTVerPage = require("./utils/isTVerPage");
const { screenshot } = require("./utils/screenshot");

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
    const { driver, url, player } = this;

    await player.play({ driver, url });
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

  /**
   * @param {Function} logger
   * @returns {Fluture}
   */
  logger(logger) {
    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    let length = {
      videos: 0,
      playing: 0,
      ended: 0
    };

    const waitP = async () => {
      while (!isCancel()) {
        const { driver } = this;
        const elements = await driver.findElements(By.css("video"));

        if (isCancel()) break;

        const videos = await Promise.all(
          elements.map(element =>
            Promise.all([
              element.getAttribute("paused"),
              element.getAttribute("ended")
            ])
          )
        );

        if (isCancel()) break;

        const playing = videos.filter(([paused]) => !paused).length;
        const ended = videos.filter(([, ended]) => ended).length;

        if (
          length.videos !== videos.length ||
          length.playing !== playing ||
          length.ended !== ended
        ) {
          logger(`${videos.length} videos ${playing} playing ${ended} ended`);
        }

        length = {
          videos: videos.length,
          playing,
          ended
        };

        // NOTE: Interval time.
        await driver.sleep(200);
      }
    };

    return Fluture((_, res) => {
      waitP().then(res);
      return onCancel;
    });
  }

  /**
   * @param {String} [path]
   */
  async screenshot(path = "screenshot.png") {
    const { driver } = this;

    await screenshot(driver, path);
  }
}

module.exports = { Page };
