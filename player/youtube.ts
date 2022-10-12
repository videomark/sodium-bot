import { By } from "selenium-webdriver";
import * as player from "./player";

export async function play({
  driver,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await driver.get(url.toString());
  await driver
    .findElement(By.css("button.ytp-ad-survey-interstitial-action-button"))
    .click()
    .catch(() => {});
  await driver
    .findElement(By.css("button.ytp-ad-skip-button"))
    .click()
    .catch(() => {});

  // Full-screen
  await driver
    .findElement(By.css("html"))
    .sendKeys("f")
    .catch(() => {});
}
