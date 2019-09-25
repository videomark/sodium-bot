import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?paravi\.jp$/i;

const isThisPage = (url: URL) =>
  isSamePage(url, {
    hostname
  });

export default isThisPage;
