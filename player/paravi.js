const { WebDriver, By, until } = require("selenium-webdriver");
const Player = require("./player");

class ParaviPlayer extends Player {
  /**
   * @override
   * @param {{driver: WebDriver, url: URL}} options
   */
  async play({ driver, url }) {
    await super.play({ driver, url });

    const playButton = By.css("i.fa.fa-play5");
    await driver.wait(until.elementLocated(playButton));
    await driver.findElement(playButton).then(el => el.click());
  }
}

module.exports = { ParaviPlayer };
