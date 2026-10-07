const { AppError } = require('../utils/AppError')

/**
 * Zod validation middleware factory.
 * usage: validate(signupSchema)
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ')
      return next(new AppError(message || 'Validation failed', 400))
    }

    req.body = result.data
    return next()
  }
}

module.exports = { validate }
