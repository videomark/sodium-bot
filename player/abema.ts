import isSamePage from "../utils/isSamePage.ts";
import * as player from "./player.ts";

/** Abemaであることを判定するためのホスト名のパターン */
const hostname = "abema.tv";

/** Abemaであるか否か */
export function inAbemaPage(url: URL): boolean {
  return isSamePage(url, { hostname });
}

/** Abemaでの視聴 */
export async function playAbema({
  page,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await page.goto(url.toString());

  // Full-screen
  await page.keyboard.press("f").catch(() => {});
}
