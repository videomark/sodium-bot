import isSamePage from "./isSamePage.ts";

const inSettingsPage = (url: URL) =>
  isSamePage(url, {
    protocol: "chrome-extension:",
    pathname: "/index.html",
    hash: "#/settings",
  });

export default inSettingsPage;
