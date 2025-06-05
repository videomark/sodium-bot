import assert from "node:assert/strict";
import type { Page } from "playwright";
import isSamePage from "../utils/isSamePage.ts";
import * as player from "./player.ts";

/** ログイン画面のURL */
const loginEndpoint = "https://www.netflix.com/login";

/** ログイン成功までの判定時間 (ms) */
const loginTimeout = 10_000;

/** 再生開始までの判定時間 (ms) */
const loadingTimeout = 30_000;

/** Netflixであることを判定するためのホスト名のパターン */
const hostname = "www.netflix.com";

/**
 * Netflixのログインを行う
 * @param auth 認証情報
 */
export async function setupNetflix(
  page: Page,
  auth: {
    /** メールアドレス or 電話番号 */
    user: string;
    /** パスワード */
    password: string;
  },
) {
  await page.goto(loginEndpoint);

  const loginPage = page.url();

  await page.fill(`input[type="text"]`, auth.user);
  await page.fill(`input[type="password"]`, auth.password);
  await page.locator(`button[type="submit"]`).press("Enter");

  const timeoutAt = Date.now() + loginTimeout;
  while (page.url() === loginPage) {
    assert(Date.now() < timeoutAt, "Netflix login timed out.");
    await page.waitForTimeout(200);
  }

  await page.goto("about:blank");
}

/** Netflixであるか否か */
export function inNetflixPage(url: URL): boolean {
  return isSamePage(url, { hostname });
}

/** Netflixでの視聴 */
export async function playNetflix({
  page,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await page.goto(url.toString());

  // Full-screen
  // NOTE: 再生が開始しない限りフルスクリーンにできないので待機
  await page.waitForSelector("video", { timeout: loadingTimeout });
  await page
    .locator("video")
    .press("f")
    .catch(() => {});
}
