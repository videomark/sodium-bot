const {
  HttpClient,
  Executor: SeleniumExecutor
} = require("selenium-webdriver/http");

class Executor extends SeleniumExecutor {
  /**
   * @param {String} url Selenium Remote
   */
  constructor(url) {
    const client = new HttpClient(url);
    super(client);
    this.w3c = true;
    this.defineCommand(
      "sendDevToolsCommand",
      "POST",
      "/session/:sessionId/chromium/send_command"
    );
  }
}

module.exports = Executor;
