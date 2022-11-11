import { WebDriver, By } from "selenium-webdriver";
import Fluture, { FutureInstance } from "fluture";
import * as player from "./player/player";
import { play as playYouTube } from "./player/youtube";
import { play as playParavi } from "./player/paravi";
import { play as playTVer } from "./player/tver";
import { isNetflixPage, playNetflix } from "./player/netflix";
import { isAbemaPage, playAbema } from "./player/abema";
import { playJWPlayer } from "./player/jwplayer";
import isYouTubePage from "./utils/isYouTubePage";
import isParaviPage from "./utils/isParaviPage";
import isTVerPage from "./utils/isTVerPage";
import { screenshot } from "./utils/screenshot";

const players = [
  { supported: isYouTubePage, play: playYouTube },
  { supported: isParaviPage, play: playParavi },
  { supported: isTVerPage, play: playTVer },
  { supported: isNetflixPage, play: playNetflix },
  { supported: isAbemaPage, play: playAbema },
] as const;

class PageController {
  driver: WebDriver;
  url: URL;
  stopHandler?: player.StopHandler;

  constructor({ driver, url }: { driver: WebDriver; url: URL }) {
    this.driver = driver;
    this.url = url;
  }

  async play() {
    const { driver, url } = this;

    for (const player of players) {
      if (player.supported(url)) {
        this.stopHandler = await player.play({ driver, url });
        return;
      }
    }

    this.stopHandler = await playJWPlayer({ driver, url });
  }

  async stop() {
    const { driver, stopHandler } = this;

    await player.stop({
      handler: stopHandler,
      driver,
      url: "about:blank",
    });
  }

  /**
   * @param ms timeout
   */
  async waitForPlaying(ms: number) {
    const { driver } = this;

    await player.waitForPlaying({ driver, timeout: ms });
  }

  /**
   * @param ms timeout
   */
  async waitForShowStatus(ms: number) {
    const { driver } = this;

    await player.waitForShowStatus({ driver, timeout: ms });
  }

  /**
   * @param ms timeout
   */
  async waitForShowQuality(ms: number) {
    const { driver } = this;

    await player.waitForShowQuality({ driver, timeout: ms });
  }

  logger(handler: (message: string) => void): FutureInstance<never, void> {
    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    let length = {
      videos: NaN,
      playing: NaN,
      ended: NaN,
    };

    const waitP = async () => {
      while (!isCancel()) {
        const { driver } = this;
        const elements = await driver.findElements(By.css("video"));

        if (isCancel()) break;

        const all = Promise.all.bind(Promise);
        const videos = (
          await all(
            elements.map((element) =>
              all([
                element.getAttribute("paused"),
                element.getAttribute("ended"),
              ]).catch(() => null)
            )
          )
        ).filter(
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
          handler(`${videos.length} videos ${playing} playing ${ended} ended`);

          if (ended > 0) {
            onCancel();
            break;
          }
        }

        length = {
          videos: videos.length,
          playing,
          ended,
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
