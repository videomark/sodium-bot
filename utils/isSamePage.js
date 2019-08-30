/**
 * @param {URL} urlLeft
 * @param {URL} urlRight
 */
const isSamePage = (urlLeft, urlRight) =>
  [
    "protocol",
    "username",
    "password",
    "hostname",
    "port",
    "pathname",
    "search",
    "hash"
  ]
    .filter(key => urlLeft[key] != null && urlRight[key] != null)
    .every(key =>
      urlRight[key] instanceof RegExp
        ? urlRight[key].test(urlLeft[key])
        : urlLeft[key] === urlRight[key]
    );

module.exports = isSamePage;
