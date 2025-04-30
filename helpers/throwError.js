/**
 * Creates and throws a custom HTTP error with a status code.
 *
 * @param {string} message - The error message to be returned to the client.
 * @param {number} [statusCode=500] - HTTP status code (e.g., 400 for Bad Request, 401 for Unauthorized).
 * @throws {Error} - Throws an error object with attached statusCode.
 */
function throwError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }
  
  module.exports = throwError;
  