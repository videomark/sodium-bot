import { WebDriver, until, By, WebElement } from "selenium-webdriver";
import Fluture, { promise, race, rejectAfter } from "fluture";

export interface PlayerOptions {
  driver: WebDriver;
  url: URL | string;
}

class Player {
  driver?: WebDriver;

  async onStop() {}

  async play({ driver, url }: PlayerOptions) {
    this.driver = driver;

    await driver.get(url.toString());
  }

  async stop(url: URL | string) {
    const { driver, onStop } = this;

    await onStop();

    if (driver != null) await driver.get(url.toString());
  }

  /**
   * @param ms timeout
   */
  async waitForPlaying(ms: number) {
    const { driver } = this;

    if (driver == null) throw new Error("You need to call play.");

    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    const waitP = async () => {
      while (!isCancel()) {
        const elements: WebElement[] = await driver.findElements(
          By.css("video")
        );

        if (isCancel()) break;

        const playing = (await Promise.all(
          elements.map(element => element.getAttribute("paused"))
        )).some(paused => !paused);

        if (isCancel() || playing) break;

        // NOTE: Interval time (ms).
        await driver.sleep(200);
      }
    };

    const wait = Fluture((_, res) => {
      waitP().then(res);
      return onCancel;
    });
    const source = race(rejectAfter(ms, "Not playing."), wait);
    await promise(source);
  }

  /**
   * @param ms timeout
   */
  async waitForShowStatus(ms: number) {
    const { driver } = this;

    if (driver == null) throw new Error("You need to call play.");

    await driver.wait(
      until.elementsLocated(By.css("#__videomark_ui")),
      ms,
      "Status not found."
    );
  }

  /**
   * @param ms timeout
   */
  async waitForShowQuality(ms: number) {
    const { driver } = this;

    if (driver == null) throw new Error("You need to call play.");

    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    const waitP = async () => {
      while (!isCancel()) {
        const text = await driver.executeScript(
          [
            `const root = document.querySelector("#__videomark_ui").shadowRoot`,
            `return root.querySelector("summary").innerText`
          ].join(";")
        );

        if (isCancel()) break;
        if (typeof text === "string" && /\s[1-5](\.\d*)?\s/.test(text)) break;

        // NOTE: Interval time (ms).
        await driver.sleep(200);
      }
    };

    const wait = Fluture((_, res) => {
      waitP().then(res);
      return onCancel;
    });
    const source = race(rejectAfter(ms, "Quality not found."), wait);
    await promise(source);
  }
}

export default Player;
