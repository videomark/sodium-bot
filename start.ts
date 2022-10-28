import * as arg from "arg";
import { basename } from "path";
import { job } from "cron";
import { promise, race, after } from "fluture";
import { WebDriver } from "selenium-webdriver";
import { PageController } from "./";
import { loadSession } from "./utils/session";
import logger from "./utils/logger";
import { setup } from "./setup";

const { SESSION_ID, BROWSER, ANDROID_DEVICE_SERIAL } = process.env;

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
 * @param driver WebDriver
 */
const play = async (url: URL, seconds: number = 60, driver?: WebDriver) => {
  const page = new PageController({
    driver: driver || (await loadSession()),
    url,
  });
  const timeoutIn = seconds * 1e3;
  const timeoutAt = Date.now() + timeoutIn;
  const timeout = setTimeout(async () => {
    await page.stop();
    throw new Error(`${seconds} seconds timeout.`);
  }, timeoutIn);

  try {
    await retry(3, async () => {
      logger.info("Play...");
      logger.info(`URL: ${url}`);
      await page.screenshot();
      await page.play();
      await page.screenshot();
      await page.waitForPlaying(30_000);
      logger.info("Playing.");
      await page.screenshot();
      await page.waitForShowStatus(90_000);
      logger.info("Show status.");
      await page.screenshot();
    });
  } catch (error) {
    await page.stop();
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const [left, right] = [
    after(Math.max(0, timeoutAt - Date.now()))(undefined as unknown),
    page.logger((message) => {
      logger.info(message);
      page.screenshot();
    }),
  ];

  await promise(race(left)(right));
  await page.stop();
  logger.info("Stop.");
};

/**
 * @param driver WebDriver
 */
const autoPlay = async (driver?: WebDriver) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { promises: fs } = await import("fs");
  const { readFile } = fs;
  const { schedule, playlist } = JSON.parse(
    (await readFile("./botconfig.json")).toString()
  );

  job(
    schedule,
    async () => {
      for (const { url, timeout } of playlist) {
        try {
          await play(new URL(url), timeout, driver);
        } catch (error) {
          logger.error(error);
        }
      }
    },
    undefined,
    undefined,
    timeZone
  ).start();
};

const main = async () => {
  const args = arg({
    "-h": "--help",
    "--help": Boolean,
    "--android": Boolean,
    "--android-device-serial": String,
    "--session-id": String,
    "-t": "--timeout",
    "--timeout": Number,
  });

  if (args["--help"]) {
    console.log(
      [
        `Usage: ${process.argv0} ${basename(__filename)} [options] [url]`,
        "Options:",
        "-h, --help                   print command line options",
        "--android                    connect to android device with adb",
        "--android-device-serial=...  (optional) device serial number",
        "--session-id=...             set session id",
        "-t, --timeout=...            set timeout period (seconds)",
      ].join("\n")
    );
    return;
  }

  const browser =
    args["--android"] || args["--android-device-serial"] != null
      ? "android"
      : BROWSER;
  const androidDeviceSerial =
    args["--android-device-serial"] == null
      ? ANDROID_DEVICE_SERIAL
      : args["--android-device-serial"];
  const sessionId =
    args["--session-id"] == null ? SESSION_ID : args["--session-id"];
  const timeout = args["--timeout"];
  const url = args._[0];

  if (browser === "chrome" && sessionId == null) {
    throw new Error("SESSION_ID or --session-id=... required.");
  }

  const driver = await setup(browser, {
    sessionId,
    androidDeviceSerial,
  });

  // NOTE: Unhandled promise rejection terminates Node.js process with non-zero exit code.
  process.on("unhandledRejection", (event) => {
    throw event;
  });

  if (url == null) {
    await autoPlay(driver);
  } else {
    await play(new URL(url), timeout, driver);
  }
};

if (require.main === module) main();
