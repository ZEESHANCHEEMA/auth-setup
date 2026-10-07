const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 12

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

/** Hash opaque tokens / OTPs before storing in DB */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999))
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex')
}

module.exports = {
  hashPassword,
  comparePassword,
  hashToken,
  generateOtpCode,
  generateRefreshToken,
}
