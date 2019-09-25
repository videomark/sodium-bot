import isSamePage from "./isSamePage";

const protocol = "chrome-extension:";
const pathname = "/qoelog/index.html";
const hash = /^#\/settings\W/;

const isThisPage = (url: URL) =>
  isSamePage(url, {
    protocol,
    pathname,
    hash
  });

export default isThisPage;
