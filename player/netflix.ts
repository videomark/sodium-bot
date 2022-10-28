import * as assert from "node:assert/strict";
import { By, Key, until, WebDriver } from "selenium-webdriver";
import * as player from "./player";
import isSamePage from "../utils/isSamePage";

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
  driver: WebDriver,
  auth: {
    /** メールアドレス or 電話番号 */
    user: string;
    /** パスワード */
    password: string;
  }
) {
  await driver.get(loginEndpoint);
  const currentUrl = await driver.getCurrentUrl();
  await driver.findElement(By.css(`input[type="text"]`)).sendKeys(auth.user);
  await driver
    .findElement(By.css(`input[type="password"]`))
    .sendKeys(auth.password, Key.RETURN);
  const timeoutAt = Date.now() + loginTimeout;
  while ((await driver.getCurrentUrl()) === currentUrl) {
    assert(Date.now() < timeoutAt, "Netflix login timed out.");
    await driver.sleep(200);
  }
  await driver.get("about:blank");
}

/** Netflixであるか否か */
export function isNetflixPage(url: URL): boolean {
  return isSamePage(url, { hostname });
}

/** Netflixでの視聴 */
export async function playNetflix({
  driver,
  url,
}: player.Options): ReturnType<typeof player.play> {
  await driver.get(url.toString());

  // Full-screen
  // NOTE: 再生が開始しない限りフルスクリーンにできないので待機
  await driver.wait(
    until.elementsLocated(By.css("video")),
    loadingTimeout,
    "Loading timed out."
  );
  await driver
    .findElement(By.css("video"))
    .sendKeys("f")
    .catch(() => {});
}
