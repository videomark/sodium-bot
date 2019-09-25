import { promises as fs } from "fs";
import { WebDriver } from "selenium-webdriver";

const { writeFile } = fs;

const screenshot = async (driver: WebDriver, path: string) => {
  const buffer = Buffer.from(await driver.takeScreenshot(), "base64");
  await writeFile(path, buffer);
};

export { screenshot };
