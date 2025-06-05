import Fluture, { type FutureInstance } from "fluture";
import type { Page } from "playwright";
import { inAbemaPage, playAbema } from "./player/abema.ts";
import { inNetflixPage, playNetflix } from "./player/netflix.ts";
import * as player from "./player/player.ts";
import { play as playTVer } from "./player/tver.ts";
import { play as playYouTube } from "./player/youtube.ts";
import inTVerPage from "./utils/inTVerPage.ts";
import inYouTubePage from "./utils/inYouTubePage.ts";

const players = [
  { supported: inYouTubePage, play: playYouTube },
  { supported: inTVerPage, play: playTVer },
  { supported: inNetflixPage, play: playNetflix },
  { supported: inAbemaPage, play: playAbema },
] as const;

export class PageController {
  page: Page;
  url: URL;
  stopHandler?: player.StopHandler;

  constructor({ page, url }: { page: Page; url: URL }) {
    if (!players.some(({ supported }) => supported(url))) {
      throw new Error("Not supported URL.");
    }
    this.page = page;
    this.url = url;
  }

  async play() {
    const { page, url } = this;

    for (const player of players) {
      if (player.supported(url)) {
        this.stopHandler = await player.play({ page, url });
        return;
      }
    }
    throw new Error("Not supported player.");
  }

  async stop() {
    const { page, stopHandler } = this;

    await player.stop({
      handler: stopHandler,
      page,
      url: "about:blank",
    });
  }

  /**
   * @param ms timeout
   */
  async waitForPlaying(ms: number) {
    const { page } = this;

    await player.waitForPlaying({ page, timeout: ms });
  }

  /**
   * @param ms timeout
   */
  async waitForShowStatus(ms: number) {
    const { page } = this;

    await player.waitForShowStatus({ page, timeout: ms });
  }

  /**
   * @param ms timeout
   */
  async waitForShowQuality(ms: number) {
    const { page } = this;

    await player.waitForShowQuality({ page, timeout: ms });
  }

  logger(handler: (message: string) => void): FutureInstance<never, void> {
    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    let length = {
      videos: Number.NaN,
      playing: Number.NaN,
      ended: Number.NaN,
    };

    const waitP = async () => {
      while (!isCancel()) {
        const { page } = this;
        const elements = await page.$$("video");

        if (isCancel()) break;

        const all = Promise.all.bind(Promise);
        const videos = (
          await all(
            elements.map((element) =>
              all([
                element.getAttribute("paused"),
                element.getAttribute("ended"),
              ]).catch(() => null),
            ),
          )
        ).filter(
          (attributes): attributes is NonNullable<typeof attributes> =>
            attributes != null,
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
        }

        length = {
          videos: videos.length,
          playing,
          ended,
        };

        // NOTE: Interval time.
        await page.waitForTimeout(200);
      }
    };

    return Fluture((_, res) => {
      waitP().then(res);
      return onCancel;
    });
  }

  async screenshot(path = "screenshot.png") {
    await this.page.screenshot({ path });
  }
}
