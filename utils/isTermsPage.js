const isSamePage = require("./isSamePage");

const protocol = "chrome-extension:";
const pathname = "/terms.html";

/**
 * @param {URL} url
 */
const isThisPage = url => isSamePage(url, { protocol, pathname });

module.exports = isThisPage;
