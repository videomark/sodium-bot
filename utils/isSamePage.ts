type URLLike =
  | URL
  | {
      [P in
        | "protocol"
        | "username"
        | "password"
        | "hostname"
        | "port"
        | "pathname"
        | "search"
        | "hash"]?: string | RegExp;
    };

const isSamePage = (urlLeft: URLLike, urlRight: URLLike) =>
  [
    "protocol",
    "username",
    "password",
    "hostname",
    "port",
    "pathname",
    "search",
    "hash"
  ]
    .filter(key => urlLeft[key] != null && urlRight[key] != null)
    .every(key =>
      urlRight[key] instanceof RegExp
        ? urlRight[key].test(urlLeft[key])
        : urlLeft[key] === urlRight[key]
    );

export default isSamePage;
