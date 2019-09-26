import { By } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/chrome";
import Player, { PlayerOptions } from "./player";

async function replaceUserAgent(driver: Driver): Promise<() => Promise<any>> {
  const userAgent = await driver.executeScript(
    "return window.navigator.userAgent"
  );

  // NOTE: can't play on linux user agent.
  if (!(typeof userAgent == "string" && /X11; Linux x86_64/.test(userAgent))) {
    return async () => {};
  }

  // NOTE: can't play on linux user agent.
  // @ts-ignore: Property 'sendDevToolsCommand' does not exist on @types/selenium-webdriver.
  await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
    userAgent: userAgent.replace(
      "X11; Linux x86_64",
      "Windows NT 10.0; Win64; x64"
    )
  });

  return async () => {
    // @ts-ignore: Property 'sendDevToolsCommand' does not exist on @types/selenium-webdriver.
    await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
      userAgent
    });
  };
}

class TVerPlayer extends Player {
  /**
   * @override
   */
  async play({ driver, url }: PlayerOptions) {
    this.onStop = await replaceUserAgent(driver);

    await super.play({ driver, url });
    await driver.executeScript("return closeEnquete()");
    await driver
      .findElement(By.xpath(`//a[text()="最初から再生する"]`))
      .then(el => el.click())
      .catch(() => {});
  }
}

export { TVerPlayer };
