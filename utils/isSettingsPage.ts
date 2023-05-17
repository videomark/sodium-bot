import isSamePage from "./isSamePage";

const extensionUrl = {
  protocol: "chrome-extension:",
  pathname: "/index.html",
  hash: "#/settings",
};

const androidUrl = {
  protocol: "chrome:",
  pathname: "/",
  hash: /^#\/settings\W/,
};

const isThisPage = (url: URL) =>
  isSamePage(url, extensionUrl) || isSamePage(url, androidUrl);

export default isThisPage;
