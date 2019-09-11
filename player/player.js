const { WebDriver, until, By } = require("selenium-webdriver");
const { timeout } = require("../utils/timeout");

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
    const wait = async () => {
      for (;;) {
        const elements = await driver.findElements(By.css("video"));
        const playing = (await Promise.all(
          elements.map(element => element.getAttribute("paused"))
        )).some(paused => !paused);

        if (playing) break;

        // NOTE: Interval time (ms).
        await driver.sleep(200);
      }
    };

    await Promise.race([timeout(ms, "Not playing."), wait()]);
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
    const wait = async () => {
      for (;;) {
        const text = await driver.executeScript(
          [
            `const root = document.querySelector("#__videomark_ui").shadowRoot`,
            `return root.querySelector("summary").innerText`
          ].join(";")
        );
        if (/\s[1-5](\.\d*)?\s/.test(text)) break;

        // NOTE: Interval time (ms).
        await driver.sleep(200);
      }
    };

    await Promise.race([timeout(ms, "Quality not found."), wait()]);
  }
}

module.exports = Player;
