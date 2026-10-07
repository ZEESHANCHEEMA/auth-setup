const { env } = require('../config/env')

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message =
    statusCode === 500 && env.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'

  if (env.nodeEnv !== 'production') {
    console.error('[error]', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = { notFoundHandler, errorHandler }
