require('dotenv').config({ quiet: true })

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    resetSecret: required('JWT_RESET_SECRET'),
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7),
    resetExpiresIn: process.env.RESET_TOKEN_EXPIRES_IN || '10m',
  },
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
}

module.exports = { env }
