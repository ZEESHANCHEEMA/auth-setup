const { prisma } = require('../config/db')
const { env } = require('../config/env')
const { AppError } = require('../utils/AppError')
const {
  hashPassword,
  comparePassword,
  hashToken,
  generateOtpCode,
  generateRefreshToken,
} = require('../utils/hash')
const { signAccessToken, signResetToken, verifyResetToken } = require('../utils/tokens')

const REFRESH_COOKIE = 'refreshToken'

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    age: user.age,
    createdAt: user.createdAt,
  }
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000,
  }
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user)
  const refreshToken = generateRefreshToken()
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  })

  return { accessToken, refreshToken }
}

async function signup({ name, email, password, gender, age }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('Email already registered', 409)
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, gender, age },
  })

  const tokens = await issueTokenPair(user)
  return { user: publicUser(user), ...tokens }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const ok = await comparePassword(password, user.passwordHash)
  if (!ok) {
    throw new AppError('Invalid email or password', 401)
  }

  const tokens = await issueTokenPair(user)
  return { user: publicUser(user), ...tokens }
}

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError('Refresh token missing', 401)
  }

  const tokenHash = hashToken(rawRefreshToken)
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401)
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  })

  const tokens = await issueTokenPair(stored.user)
  return { user: publicUser(stored.user), ...tokens }
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return

  const tokenHash = hashToken(rawRefreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return same message to avoid email enumeration
  const generic = {
    message: 'If that email exists, an OTP has been sent.',
  }

  if (!user) return generic

  const otp = generateOtpCode()
  const codeHash = hashToken(otp)
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000)

  // Invalidate previous unused OTPs for this purpose
  await prisma.otpCode.updateMany({
    where: { userId: user.id, purpose: 'password_reset', usedAt: null },
    data: { usedAt: new Date() },
  })

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      codeHash,
      purpose: 'password_reset',
      expiresAt,
    },
  })

  // Learning mode: no email provider — print OTP in terminal
  console.log('\n========================================')
  console.log(`[OTP] password reset for ${email}`)
  console.log(`[OTP] code: ${otp} (expires in ${env.otpExpiresMinutes} min)`)
  console.log('========================================\n')

  return {
    ...generic,
    // Only in development so the UI can show a hint while learning
    ...(env.nodeEnv === 'development' ? { devOtp: otp } : {}),
  }
}

async function verifyOtp({ email, otp }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError('Invalid OTP', 400)
  }

  const codeHash = hashToken(otp)
  const record = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      purpose: 'password_reset',
      codeHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    throw new AppError('Invalid or expired OTP', 400)
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  const resetToken = signResetToken(user.id)
  return {
    message: 'OTP verified. Use resetToken to set a new password.',
    resetToken,
  }
}

async function resetPassword({ resetToken, newPassword }) {
  let payload
  try {
    payload = verifyResetToken(resetToken)
  } catch {
    throw new AppError('Invalid or expired reset token', 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    }),
    // Force re-login everywhere
    prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  return { message: 'Password reset successful. Please log in.' }
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError('User not found', 404)
  }

  const ok = await comparePassword(currentPassword, user.passwordHash)
  if (!ok) {
    throw new AppError('Current password is incorrect', 401)
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different', 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  return { message: 'Password changed. Please log in again.' }
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError('User not found', 404)
  }
  return publicUser(user)
}

module.exports = {
  REFRESH_COOKIE,
  refreshCookieOptions,
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getMe,
}
