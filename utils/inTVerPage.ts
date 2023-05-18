import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?tver\.jp$/i;

const inTVerPage = (url: URL) =>
  isSamePage(url, {
    hostname,
  });

export default inTVerPage;
