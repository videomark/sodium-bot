class TimeoutError extends Error {
  /**
   * @param {Number} ms
   * @param {String} [message] error message
   */
  constructor(ms, message) {
    super(
      [message, `Wait timed out after ${ms} ms.`]
        .filter(message => message != null)
        .join("\n")
    );
  }
}

/**
 * @param {Number} ms
 * @param {String} [message] error message
 * @returns {Promise<void>}
 */
const timeout = (ms, message) => {
  const error = new TimeoutError(ms, message);
  const promise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(error);
    }, ms);
  });

  return promise;
};

module.exports = { TimeoutError, timeout };
