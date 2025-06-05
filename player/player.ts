import Fluture, { promise, race, rejectAfter } from "fluture";
import type { Page } from "playwright";

export interface Options {
  page: Page;
  url: URL | string;
}

export type StopHandler = (() => Promise<any>) | void;

export async function play({ page, url }: Options): Promise<StopHandler> {
  await page.goto(url.toString());
}

export async function stop({
  page,
  url,
  handler,
}: {
  page?: Page;
  url?: URL | string;
  handler?: StopHandler;
}) {
  if (handler != null) await handler();
  if (page != null) {
    await page.goto(url == null ? "about:blank" : url.toString());
  }
}

export async function waitForPlaying({
  page,
  timeout,
}: {
  page: Page;
  timeout: number;
}) {
  let cancel = false;
  const isCancel = () => cancel;
  const onCancel = () => (cancel = true);

  const waitP = async () => {
    while (!isCancel()) {
      await page.waitForSelector("video");
      const elements = await page.$$("video");

      if (isCancel()) break;

      const playing = (
        await Promise.all(
          elements.map((element) => element.getAttribute("paused")),
        )
      ).some((paused) => !paused);

      if (isCancel() || playing) break;

      // NOTE: Interval time (ms).
      await page.waitForTimeout(200);
    }
  };

  const wait = Fluture<Error, unknown>((_, res) => {
    waitP().then(res);
    return onCancel;
  });
  const source = race(wait)(rejectAfter(timeout)(new Error("Not playing.")));
  await promise(source);
}

export async function waitForShowStatus({
  page,
  timeout,
}: {
  page: Page;
  timeout: number;
}) {
  await page.waitForSelector("#__videomark_ui", { timeout });
}

export async function waitForShowQuality({
  page,
  timeout,
}: {
  page: Page;
  timeout: number;
}) {
  if (page == null) throw new Error("You need to call play.");

  let cancel = false;
  const isCancel = () => cancel;
  const onCancel = () => (cancel = true);

  const waitP = async () => {
    while (!isCancel()) {
      const text = await page.evaluate(
        `\
const root = document.querySelector("#__videomark_ui").shadowRoot;
return root.querySelector("summary").innerText;`,
      );

      if (isCancel()) break;
      if (typeof text === "string" && /\s[1-5](\.\d*)?\s/.test(text)) break;

      // NOTE: Interval time (ms).
      await page.waitForTimeout(200);
    }
  };

  const wait = Fluture<Error, unknown>((_, res) => {
    waitP().then(res);
    return onCancel;
  });
  const source = race(wait)(
    rejectAfter(timeout)(new Error("Quality not found.")),
  );
  await promise(source);
}
