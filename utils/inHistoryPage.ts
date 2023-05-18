import isSamePage from "./isSamePage";

const protocol = "chrome-extension:";
const pathname = "/index.html";
const hash = "#/history";

const inHistoryPage = (url: URL) =>
  isSamePage(url, {
    protocol,
    pathname,
    hash,
  });

export default inHistoryPage;
