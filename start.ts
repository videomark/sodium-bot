import * as arg from "arg";
import { basename } from "path";
// @ts-ignore: @types/selenium-webdriver has no exported member 'TimeoutError'.
import { TimeoutError } from "selenium-webdriver";
import { promise, race, after } from "fluture";
import { PageController } from "./";
import { loadSession } from "./utils/session";
import logger from "./utils/logger";

const retry = async (count: number, proc: () => Promise<void>) => {
  for (const i of Array(count).keys()) {
    try {
      await proc();
      return;
    } catch (error) {
      logger.error(error);
      if (i + 1 === count) break;
    }
  }
  throw new Error(`${count} retries.`);
};

/**
 * @param url
 * @param seconds timeout
 */
const play = async (url: URL, seconds: number) => {
  const driver = await loadSession();
  const page = new PageController({ driver, url });
  const timeoutIn = seconds * 1e3;
  const timeoutAt = Date.now() + timeoutIn;
  const timeout = setTimeout(async () => {
    await page.stop();
    throw new TimeoutError(`${seconds} seconds timeout.`);
  }, timeoutIn);

  try {
    await retry(3, async () => {
      logger.info("Play...");
      await page.screenshot();
      await page.play();
      await page.screenshot();
      await page.waitForSodiumExists(1e3);
      logger.info("Sodium exists.");
      await page.screenshot();
      await page.waitForPlaying(10e3);
      logger.info("Playing.");
      await page.screenshot();
      await page.waitForShowStatus(90e3);
      logger.info("Show status.");
      await page.screenshot();
      await page.waitForShowQuality(30e3);
      logger.info("Show quality.");
      await page.screenshot();
    });
  } catch (error) {
    await page.stop();
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  await promise(
    race(
      after(Math.max(0, timeoutAt - Date.now()), undefined),
      page.logger(message => {
        logger.info(message);
        page.screenshot();
      })
    )
  );

  await page.stop();
};

const main = async () => {
  const args = arg({
    "-h": "--help",
    "--help": Boolean,
    "-t": "--timeout",
    "--timeout": Number
  });
  const help = args["--help"];
  const timeout = args["--timeout"];

  if (help || timeout == null || !Number.isFinite(timeout)) {
    console.log(
      `Usage: ${process.argv0} ${basename(__filename)} [options] url`
    );
    console.log("Options:");
    console.log(
      [
        "-h, --help              print command line options",
        "-t, --timeout=...       set timeout period (seconds)"
      ].join("\n")
    );
    return;
  }

  // NOTE: Unhandled promise rejection terminates Node.js process with non-zero exit code.
  process.on("unhandledRejection", event => {
    throw event;
  });

  await play(new URL(args._[0]), timeout);
};

if (require.main === module) main();
