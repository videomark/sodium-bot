const { WebDriver, until, By } = require("selenium-webdriver");
const Fluture = require("fluture");
const { promise, race, rejectAfter } = Fluture;

class Player {
  async onStop() {}

  /**
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    this.driver = driver;

    await driver.get(url);
  }

  /**
   * @param {String} url
   */
  async stop(url) {
    const { driver, onStop } = this;

    await onStop();
    await driver.get(url);
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForPlaying(ms) {
    const { driver } = this;

    let cancel = false;
    const isCancel = () => cancel;
    const onCancel = () => (cancel = true);

    const waitP = async () => {
      while (!isCancel()) {
        const elements = await driver.findElements(By.css("video"));

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
   * @param {Number} ms timeout
   */
  async waitForShowStatus(ms) {
    const { driver } = this;

    await driver.wait(
      until.elementsLocated(By.css("#__videomark_ui")),
      ms,
      "Status not found."
    );
  }

  /**
   * @param {Number} ms timeout
   */
  async waitForShowQuality(ms) {
    const { driver } = this;

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

        if (isCancel() || /\s[1-5](\.\d*)?\s/.test(text)) break;

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

module.exports = Player;
