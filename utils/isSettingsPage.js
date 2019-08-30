const isSamePage = require("./isSamePage");

const protocol = "chrome-extension:";
const pathname = "/qoelog/index.html";
const hash = /^#\/settings\W/;

/**
 * @param {URL} url
 */
const isThisPage = url =>
  isSamePage(url, {
    protocol,
    pathname,
    hash
  });

module.exports = isThisPage;
