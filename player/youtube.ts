import * as player from "./player.ts";

export function redirectToEmbed(url: URL | string): string {
  const embedUrl = new URL("https://www.youtube.com/embed/");
  embedUrl.searchParams.set("autoplay", "1");
  embedUrl.searchParams.set("mute", "1");
  embedUrl.searchParams.set("playsinline", "1");

  const { searchParams, pathname } = new URL(url, "https://www.youtube.com");
  const videoId = searchParams.get("v") || pathname.split("/").pop();

  if (videoId) {
    embedUrl.pathname += videoId;
  } else {
    throw new Error("Invalid YouTube URL: No video ID found.");
  }

  return embedUrl.toString();
}

export async function play({
  page,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await page.goto(redirectToEmbed(url));
  await page
    .locator("button.ytp-ad-survey-interstitial-action-button")
    .click()
    .catch(() => {});
  await page
    .locator("button.ytp-ad-skip-button")
    .click()
    .catch(() => {});
}
