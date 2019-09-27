import { WebDriver, until, By, WebElement } from "selenium-webdriver";
import Fluture, { promise, race, rejectAfter } from "fluture";

export interface Options {
  driver: WebDriver;
  url: URL | string;
}

export type StopHandler = (() => Promise<any>) | void;

export async function play({ driver, url }: Options): Promise<StopHandler> {
  await driver.get(url.toString());
}

export async function stop({
  driver,
  url,
  handler
}: {
  driver?: WebDriver;
  url?: URL | string;
  handler?: StopHandler;
}) {
  if (handler != null) await handler();
  if (driver != null) {
    await driver.get(url == null ? "about:blank" : url.toString());
  }
}

export async function waitForPlaying({
  driver,
  timeout
}: {
  driver: WebDriver;
  timeout: number;
}) {
  let cancel = false;
  const isCancel = () => cancel;
  const onCancel = () => (cancel = true);

  const waitP = async () => {
    while (!isCancel()) {
      const elements: WebElement[] = await driver.findElements(By.css("video"));

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
  const source = race(rejectAfter(timeout, "Not playing."), wait);
  await promise(source);
}

export async function waitForShowStatus({
  driver,
  timeout
}: {
  driver: WebDriver;
  timeout: number;
}) {
  await driver.wait(
    until.elementsLocated(By.css("#__videomark_ui")),
    timeout,
    "Status not found."
  );
}

export async function waitForShowQuality({
  driver,
  timeout
}: {
  driver: WebDriver;
  timeout: number;
}) {
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
  const source = race(rejectAfter(timeout, "Quality not found."), wait);
  await promise(source);
}
