import isSamePage from "./isSamePage";

const hostname = /^([^\.]+\.)?youtube\.com$/i;

const inYouTubePage = (url: URL) =>
  isSamePage(url, {
    hostname,
  });

export default inYouTubePage;
