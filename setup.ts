import "dotenv/config";
import assert from "node:assert/strict";
import type { Page } from "playwright";
import { chromium } from "playwright";
import { setupNetflix } from "./player/netflix.ts";
import inHistoryPage from "./utils/inHistoryPage.ts";
import inSettingsPage from "./utils/inSettingsPage.ts";
import inTermsPage from "./utils/inTermsPage.ts";
import logger from "./utils/logger.ts";

const { VIDEOMARK_EXTENSION_PATH, NETFLIX_USER, NETFLIX_PASSWORD } =
  process.env;

const enabledNetflix = Boolean(NETFLIX_USER);

const waitForContentRendering = async (page: Page) => {
  await page.waitForFunction(`document.readyState === "complete"`);
  await page.waitForTimeout(300);
};

const switchToTermsPage = async (page: Page) => {
  const terms = page
    .context()
    .pages()
    .find((page) => inTermsPage(new URL(page.url())));

  if (terms == null) throw new Error("Terms page is not found.");

  await page.goto(terms.url());
  await waitForContentRendering(page);
};

const closeOthers = async (page: Page) => {
  const others = page
    .context()
    .pages()
    .filter((p) => p !== page);

  for (const other of others) {
    await other.close();
  }
};

const agreeToTerms = async (page: Page) => {
  await switchToTermsPage(page);
  await closeOthers(page);
  await page
    .locator(
      `\
  //button[@aria-label="プライバシーを尊重します"]
| //button[@aria-label="We respect your privacy"]`,
    )
    .click();
  await page
    .locator(
      `\
  //button[text()="使い始める"]
| //button[text()="Get Started"]`,
    )
    .click();
  await waitForContentRendering(page);

  // NOTE: wait for welcome page to open.
  await page.waitForTimeout(10e3);

  const url = new URL(page.url());
  assert(inHistoryPage(url), "Welcome page has not been opened.");

  return url;
};

const setSessionId = async (page: Page, sessionId: string) => {
  await page.goto(
    new URL(
      `?${new URLSearchParams({
        bot: "true",
        session_id: sessionId,
      })}#/settings`,
      page.url(),
    ).toString(),
  );
  assert(
    inSettingsPage(new URL(page.url())),
    "Settings page has not been opened.",
  );

  assert.equal(
    await page
      .locator(
        `\
  //*[*/text()="セッション ID"]/following-sibling::*
| //*[*/text()="Session ID"]/following-sibling::*`,
      )
      .textContent(),
    sessionId,
    "Failed to set Session ID.",
  );
};

const build = async (browser = "chrome") => {
  if (VIDEOMARK_EXTENSION_PATH == null) {
    throw new Error("VIDEOMARK_EXTENSION_PATH required.");
  }

  if (browser !== "chrome") {
    throw new Error(`Unsupported browser: ${browser}`);
  }

  const ctx = await chromium.launchPersistentContext("", {
    channel: "chrome",
    headless: false,
    viewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      `--disable-extensions-except=${VIDEOMARK_EXTENSION_PATH}`,
      `--load-extension=${VIDEOMARK_EXTENSION_PATH}`,
    ],
  });

  const page = await ctx.newPage();
  await page.waitForTimeout(10_000); // Wait for extension to load
  const worker = ctx.serviceWorkers().at(-1);
  // @ts-expect-error chrome is not defined typing
  await worker.evaluate(() => chrome.action.onClicked.dispatch());

  return page;
};

export const setup = async (browser = "chrome", sessionId?: string) => {
  let page: Page;

  try {
    logger.info("Wait for warm up...");
    page = await build(browser);

    logger.info("Agree to terms.");
    await agreeToTerms(page);

    if (sessionId != null) {
      await setSessionId(page, sessionId);
      logger.info(`Session ID: ${sessionId}`);
    }

    if (enabledNetflix) {
      logger.info("Login to Netflix.");
      await setupNetflix(page, {
        user: NETFLIX_USER ?? "",
        password: NETFLIX_PASSWORD ?? "",
      });
    }

    logger.info("Setup complete.");
  } catch (error) {
    if (page!) {
      logger.error(`Current URL: ${page.url()}`);
      await page.close();
    }

    throw error;
  }

  return page;
};
