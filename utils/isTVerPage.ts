import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?tver\.jp$/i;

const isThisPage = (url: URL) =>
  isSamePage(url, {
    hostname
  });

export default isThisPage;
