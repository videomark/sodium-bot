import type { Page } from "playwright";
import * as player from "./player.ts";

const linuxUserAgentRegExp = /X11; Linux (x86_64|aarch64)/;

async function replaceUserAgent(page: Page): Promise<player.StopHandler> {
  const userAgent = await page.evaluate("return window.navigator.userAgent");

  // NOTE: can't play on linux user agent.
  if (!(typeof userAgent == "string" && linuxUserAgentRegExp.test(userAgent))) {
    return async () => {};
  }

  const client = await page.context().newCDPSession(page);

  // NOTE: can't play on linux user agent.
  await client.send("Network.setUserAgentOverride", {
    userAgent: userAgent.replace(
      linuxUserAgentRegExp,
      "Windows NT 10.0; Win64; x64",
    ),
  });

  return async () => {
    await client.send("Network.setUserAgentOverride", {
      userAgent,
    });
  };
}

export async function play({
  page,
  url,
}: player.Options): ReturnType<typeof player.play> {
  const stopHandler = await replaceUserAgent(page);
  await page.goto(url.toString());
  await page.evaluate("return closeEnquete()");
  await page
    .locator(`//a[text()="最初から再生する"]`)
    .click()
    .catch(() => {});
  return stopHandler;
}
