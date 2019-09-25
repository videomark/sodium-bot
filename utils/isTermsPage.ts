import isSamePage from "./isSamePage";

const protocol = "chrome-extension:";
const pathname = "/terms.html";

const isThisPage = (url: URL) => isSamePage(url, { protocol, pathname });

export default isThisPage;
