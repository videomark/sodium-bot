import { promises as fs } from "fs";
import { loadSession } from "./utils/session";
import logger from "./utils/logger";

const { unlink } = fs;

const main = async () => {
  const driver = await loadSession();
  await driver.quit();
  await unlink("./session.json");
  logger.info("Quit session.");
};

if (require.main === module) main();
