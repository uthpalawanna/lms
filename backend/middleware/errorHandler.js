function errorHandler(err, req, res, next) {
  // If headers are already sent, delegate to default Express handler
  if (res.headersSent) return next(err);

  // Log the error server-side
  // Keep console for now; projects can swap in winston/pino later
  console.error(err.stack || err.message || err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Avoid leaking stack traces in production
  const payload = { message };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
