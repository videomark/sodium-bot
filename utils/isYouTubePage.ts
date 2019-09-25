import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?youtube\.com$/i;

const isThisPage = (url: URL) =>
  isSamePage(url, {
    hostname
  });

export default isThisPage;
