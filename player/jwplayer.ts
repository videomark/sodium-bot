import { By } from "selenium-webdriver";
import * as player from "./player";

/** JWPlayerでの視聴 */
export async function playJWPlayer({
  driver,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await driver.get(url.toString());
  const videoElement = await driver.findElement(By.css("video"));
  await videoElement.click()
  await driver.executeScript(
    `
const video = document.getElementsByTagName("video")[0];
video.play();
video.requestFullscreen();
`
  );
}
