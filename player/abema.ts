import { By } from "selenium-webdriver";
import * as player from "./player";
import isSamePage from "../utils/isSamePage";

/** Abemaであることを判定するためのホスト名のパターン */
const hostname = "abema.tv";

/** Abemaであるか否か */
export function isAbemaPage(url: URL): boolean {
  return isSamePage(url, { hostname });
}

/** Abemaでの視聴 */
export async function playAbema({
  driver,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await driver.get(url.toString());

  // Full-screen
  await driver
    .findElement(By.css("html"))
    .sendKeys("f")
    .catch(() => {});
}
