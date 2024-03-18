import { By, WebDriver } from "selenium-webdriver";
import * as player from "./player";

const linuxUserAgentRegExp = /X11; Linux (x86_64|aarch64)/;

async function replaceUserAgent(
  driver: WebDriver,
): Promise<player.StopHandler> {
  const userAgent = await driver.executeScript(
    "return window.navigator.userAgent",
  );

  // NOTE: can't play on linux user agent.
  if (!(typeof userAgent == "string" && linuxUserAgentRegExp.test(userAgent))) {
    return async () => {};
  }

  // NOTE: can't play on linux user agent.
  // @ts-ignore: Property 'sendDevToolsCommand' does not exist on @types/selenium-webdriver.
  await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
    userAgent: userAgent.replace(
      linuxUserAgentRegExp,
      "Windows NT 10.0; Win64; x64",
    ),
  });

  return async () => {
    // @ts-ignore: Property 'sendDevToolsCommand' does not exist on @types/selenium-webdriver.
    await driver.sendDevToolsCommand("Network.setUserAgentOverride", {
      userAgent,
    });
  };
}

export async function play({
  driver,
  url,
}: player.Options): ReturnType<typeof player.play> {
  const stopHandler = await replaceUserAgent(driver);
  await driver.get(url.toString());
  await driver.executeScript("return closeEnquete()");
  await driver
    .findElement(By.xpath(`//a[text()="最初から再生する"]`))
    .click()
    .catch(() => {});
  return stopHandler;
}
