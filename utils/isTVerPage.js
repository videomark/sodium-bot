const isSamePage = require("./isSamePage");

const hostname = /^([^\.]+\.)?tver\.jp$/i;

/**
 * @param {URL} url
 */
const isThisPage = url =>
  isSamePage(url, {
    hostname
  });

module.exports = isThisPage;
