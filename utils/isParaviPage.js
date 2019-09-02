const isSamePage = require("./isSamePage");

const hostname = /^([^\.]+\.)?paravi\.jp$/i;

/**
 * @param {URL} url
 */
const isThisPage = url =>
  isSamePage(url, {
    hostname
  });

module.exports = isThisPage;
