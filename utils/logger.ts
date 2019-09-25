import debug from "debug";

debug.log = console.debug.bind(console);

const levels: (keyof Console & ("error" | "warn" | "info"))[] = [
  "error",
  "warn",
  "info"
];

const [error, warn, info] = levels.map(level => {
  const logger = debug(level);
  logger.log = console[level].bind(console);

  return logger;
});

debug.enable(levels.join());

export default { error, warn, info, debug };
