import arg from "arg";
import { CronJob } from "cron";
import { after, promise, race } from "fluture";
import { basename } from "node:path";
import type { Page } from "playwright";
import { PageController } from "./controller.ts";
import { setup } from "./setup.ts";
import logger from "./utils/logger.ts";

const { SESSION_ID, BROWSER } = process.env;

const retry = async (count: number, proc: () => Promise<void>) => {
  for (const _ of Array(count).keys()) {
    try {
      await proc();
      return;
    } catch (error) {
      logger.error(error);
    }
  }
  throw new Error(`${count} retries.`);
};

/**
 * @param url
 * @param seconds timeout
 */
const play = async (url: URL, seconds = 60, page: Page) => {
  const controller = new PageController({ page, url });
  const timeoutIn = seconds * 1e3;
  const timeoutAt = Date.now() + timeoutIn;
  const timeout = setTimeout(async () => {
    await controller.stop();
    throw new Error(`${seconds} seconds timeout.`);
  }, timeoutIn);

  try {
    await retry(3, async () => {
      logger.info("Play...");
      logger.info(`URL: ${url}`);
      await controller.screenshot();
      await controller.play();
      await controller.screenshot();
      await controller.waitForPlaying(30_000);
      logger.info("Playing.");
      await controller.screenshot();
      await controller.waitForShowStatus(90_000);
      logger.info("Show status.");
      await controller.screenshot();
    });
  } catch (error) {
    await controller.stop();
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const [left, right] = [
    after(Math.max(0, timeoutAt - Date.now()))(undefined as unknown),
    controller.logger((message) => {
      logger.info(message);
      controller.screenshot();
    }),
  ];

  await promise(race(left)(right));
  await controller.stop();
  logger.info("Stop.");
};

const autoPlay = async (page: Page) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fs = await import("node:fs/promises");
  const { schedule, playlist } = JSON.parse(
    (await fs.readFile("./botconfig.json")).toString(),
  );

  CronJob.from({
    start: true,
    cronTime: schedule,
    async onTick() {
      const startedAt = new Date();
      for (const { url, timeout, at, base = "system" } of playlist) {
        const now = {
          system() {
            return new Date().toLocaleTimeString(undefined, {
              minute: "2-digit",
              second: "2-digit",
            });
          },
          relative() {
            return new Date(
              Date.now() - startedAt.valueOf(),
            ).toLocaleTimeString(undefined, {
              timeZone: "UTC",
              minute: "2-digit",
              second: "2-digit",
            });
          },
        }[base as "system" | "relative"];
        while (now() < at) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        try {
          await play(new URL(url), timeout, page);
        } catch (error) {
          logger.error(error);
        }
      }
    },
    timeZone,
  });

  // Keep the process running
  await new Promise(() => {});
};

const main = async () => {
  const args = arg({
    "-h": "--help",
    "--help": Boolean,
    "--session-id": String,
    "-t": "--timeout",
    "--timeout": Number,
  });

  if (args["--help"]) {
    console.log(`\
Usage: ${process.argv0} ${basename(import.meta.filename)} [options] [url]
Options:
  -h, --help          print command line options
  --session-id=...    set session id
  -t, --timeout=...   set timeout period (seconds)`);

    return;
  }

  const sessionId =
    args["--session-id"] == null ? SESSION_ID : args["--session-id"];
  const timeout = args["--timeout"];
  const [url] = args._;

  const page = await setup(BROWSER, sessionId);

  if (url) {
    await play(new URL(url), timeout, page);
  } else {
    await autoPlay(page);
  }

  await page.close();
};

await main();
