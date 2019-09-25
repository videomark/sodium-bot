import isSamePage from "./isSamePage";

const protocol = "chrome-extension:";
const pathname = "/qoelog/index.html";
const hash = "#/welcome";

const isThisPage = (url: URL) =>
  isSamePage(url, {
    protocol,
    pathname,
    hash
  });

export default isThisPage;
