import { By } from "selenium-webdriver";
import Player, { PlayerOptions } from "./player";

class YouTubePlayer extends Player {
  /**
   * @override
   */
  async play({ driver, url }: PlayerOptions) {
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

export { YouTubePlayer };
