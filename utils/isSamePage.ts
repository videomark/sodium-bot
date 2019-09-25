type URLProperty = keyof URL &
  (
    | "protocol"
    | "username"
    | "password"
    | "hostname"
    | "port"
    | "pathname"
    | "search"
    | "hash");

type URLLike =
  | URL
  | {
      [P in URLProperty]?: string | RegExp;
    };

const property: URLProperty[] = [
  "protocol",
  "username",
  "password",
  "hostname",
  "port",
  "pathname",
  "search",
  "hash"
];

const isSamePage = (urlLeft: URLLike, urlRight: URLLike) =>
  property
    .filter(key => urlLeft[key] != null && urlRight[key] != null)
    .every(key => {
      const [lProp, rProp] = [urlLeft[key], urlRight[key]];

      if (typeof lProp === "string" && typeof rProp === "string") {
        return lProp === rProp;
      }
      if (typeof lProp === "string" && rProp instanceof RegExp) {
        return rProp.test(lProp);
      }
      if (lProp instanceof RegExp && typeof rProp === "string") {
        return lProp.test(rProp);
      }

      return false;
    });

export default isSamePage;
