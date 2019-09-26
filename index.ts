import { WebDriver, until, By } from "selenium-webdriver";
import Fluture, { FutureInstance } from "fluture";
import Player from "./player/player";
import { YouTubePlayer } from "./player/youtube";
import { ParaviPlayer } from "./player/paravi";
import { TVerPlayer } from "./player/tver";
import isYouTubePage from "./utils/isYouTubePage";
import isParaviPage from "./utils/isParaviPage";
import isTVerPage from "./utils/isTVerPage";
import { screenshot } from "./utils/screenshot";

interface ConstructorProps {
  driver: WebDriver;
  url: URL;
}

class PageController {
  player: Player;
  driver: WebDriver;
  url: URL;

  constructor({ driver, url }: ConstructorProps) {
    this.driver = driver;
    this.url = url;

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
   * @param ms timeout
   */
  async waitForSodiumExists(ms: number) {
    const { driver } = this;

    await driver.wait(
      until.elementsLocated(By.css(`script[src^="chrome"][src$="/sodium.js"]`)),
      ms,
      "Sodium.js not found."
    );
  }

  /**
   * @param ms timeout
   */
  async waitForPlaying(ms: number) {
    const { player } = this;

    await player.waitForPlaying(ms);
  }

  /**
   * @param ms timeout
   */
  async waitForShowStatus(ms: number) {
    const { player } = this;

    await player.waitForShowStatus(ms);
  }

  /**
   * @param ms timeout
   */
  async waitForShowQuality(ms: number) {
    const { player } = this;

    await player.waitForShowQuality(ms);
  }

  logger(logger: (message: string) => void): FutureInstance<any, any> {
    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    let length = {
      videos: NaN,
      playing: NaN,
      ended: NaN
    };

    const waitP = async () => {
      while (!isCancel()) {
        const { driver } = this;
        const elements = await driver.findElements(By.css("video"));

        if (isCancel()) break;

        const all = Promise.all.bind(Promise);
        const videos = (await all(
          elements.map(element =>
            all([
              element.getAttribute("paused"),
              element.getAttribute("ended")
            ]).catch(() => null)
          )
        )).filter(
          (attributes): attributes is NonNullable<typeof attributes> =>
            attributes != null
        );

        if (isCancel()) break;

        const playing = videos.filter(([paused]) => paused !== "true").length;
        const ended = videos.filter(([, ended]) => ended === "true").length;

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

  async screenshot(path: string = "screenshot.png") {
    const { driver } = this;

    await screenshot(driver, path);
  }
}

export { PageController };
