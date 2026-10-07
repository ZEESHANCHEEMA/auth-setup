const { AppError } = require('../utils/AppError')
const { verifyAccessToken } = require('../utils/tokens')

/**
 * Protects routes: expects Authorization: Bearer <accessToken>
 * On success, attaches req.user = { id, email, name }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Access token missing', 401))
  }

  const token = header.slice('Bearer '.length).trim()

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    }
    return next()
  } catch {
    return next(new AppError('Invalid or expired access token', 401))
  }
}

module.exports = { authenticate }
