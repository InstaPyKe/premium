/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found`,
  });
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Safe client response (no stack traces or internal DB error dumps leaked)
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An error occurred while processing your request.',
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
