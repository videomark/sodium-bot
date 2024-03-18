import {
  HttpClient,
  Executor as SeleniumExecutor,
} from "selenium-webdriver/http";

class Executor extends SeleniumExecutor {
  w3c: boolean;

  /**
   * @param url Selenium Remote
   */
  constructor(url: URL | string) {
    const client = new HttpClient(url.toString());
    super(client);
    this.w3c = true;
    this.defineCommand(
      "sendDevToolsCommand",
      "POST",
      "/session/:sessionId/chromium/send_command",
    );
  }
}

export default Executor;
