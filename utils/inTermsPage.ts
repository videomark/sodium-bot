import isSamePage from "./isSamePage.ts";

const protocol = "chrome-extension:";
const pathname = "/index.html";
const hash = "#/onboarding";

const inTermsPage = (url: URL) =>
  isSamePage(url, {
    protocol,
    pathname,
    hash,
  });

export default inTermsPage;
