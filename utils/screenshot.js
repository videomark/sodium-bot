const { WebDriver } = require("selenium-webdriver");
const { writeFile } = require("fs").promises;

/**
 * @param {WebDriver} driver
 * @param {String} path
 */
const screenshot = async (driver, path) => {
  const buffer = Buffer.from(await driver.takeScreenshot(), "base64");
  await writeFile(path, buffer);
};

module.exports = { screenshot };
