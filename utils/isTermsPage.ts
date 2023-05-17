import isSamePage from "./isSamePage";

const protocol = "chrome-extension:";
const pathname = "/index.html";
const hash = "#/onboarding";

const isThisPage = (url: URL) =>
  isSamePage(url, {
    protocol,
    pathname,
    hash,
  });

export default isThisPage;
