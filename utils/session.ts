import { promises as fs } from "fs";
import { WebDriver, Session } from "selenium-webdriver";
import { Driver } from "selenium-webdriver/chrome";
import Executor from "./executor";

const { writeFile, readFile } = fs;
const { SELENIUM_REMOTE_URL } = process.env;

interface SerializedSession {
  id: string;
  seleniumRemoteUrl: string;
}

const serialize = async (driver: WebDriver): Promise<SerializedSession> => {
  if (SELENIUM_REMOTE_URL == null) {
    throw new Error("SELENIUM_REMOTE_URL required.");
  }

  return {
    id: (await driver.getSession()).getId(),
    seleniumRemoteUrl: SELENIUM_REMOTE_URL,
  };
};

export async function saveSession(
  driver: WebDriver,
  path: string = "session.json",
) {
  await writeFile(path, JSON.stringify(await serialize(driver)));
}

export async function loadSession(path: string = "session.json") {
  const { id, seleniumRemoteUrl }: SerializedSession = JSON.parse(
    (await readFile(path)).toString(),
  );
  const executor = new Executor(seleniumRemoteUrl);
  const session = new Session(id, {});
  const driver = new Driver(session, executor);
  return driver;
}
