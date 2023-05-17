import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?paravi\.jp$/i;

const inParaviPage = (url: URL) =>
  isSamePage(url, {
    hostname,
  });

export default inParaviPage;
