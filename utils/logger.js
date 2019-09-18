const debug = require("debug");

debug.log = console.debug.bind(console);

const [error, warn, info] = ["error", "warn", "info"].map(level => {
  const logger = debug(level);
  logger.log = console[level].bind(console);

  return logger;
});

debug.enable(["error", "warn", "info"].join());

module.exports = { error, warn, info, debug };
