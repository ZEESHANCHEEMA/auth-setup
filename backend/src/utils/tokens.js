const jwt = require('jsonwebtoken')
const { env } = require('../config/env')

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  )
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

function signResetToken(userId) {
  return jwt.sign({ sub: userId, purpose: 'password_reset' }, env.jwt.resetSecret, {
    expiresIn: env.jwt.resetExpiresIn,
  })
}

function verifyResetToken(token) {
  const payload = jwt.verify(token, env.jwt.resetSecret)
  if (payload.purpose !== 'password_reset') {
    throw new Error('Invalid reset token purpose')
  }
  return payload
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signResetToken,
  verifyResetToken,
}
