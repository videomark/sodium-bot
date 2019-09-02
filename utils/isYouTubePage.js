const isSamePage = require("./isSamePage");

const hostname = /^([^\.]+\.)?youtube\.com$/i;

/**
 * @param {URL} url
 */
const isThisPage = url =>
  isSamePage(url, {
    hostname
  });

module.exports = isThisPage;
