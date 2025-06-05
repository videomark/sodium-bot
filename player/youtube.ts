import * as player from "./player.ts";

export async function play({
  page,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await page.goto(url.toString());
  await page
    .locator("button.ytp-ad-survey-interstitial-action-button")
    .click()
    .catch(() => {});
  await page
    .locator("button.ytp-ad-skip-button")
    .click()
    .catch(() => {});

  // Full-screen
  await page.keyboard.press("f").catch(() => {});
}
