const authService = require('../services/auth.service')

function setRefreshCookie(res, refreshToken) {
  res.cookie(authService.REFRESH_COOKIE, refreshToken, authService.refreshCookieOptions())
}

function clearRefreshCookie(res) {
  res.clearCookie(authService.REFRESH_COOKIE, {
    httpOnly: true,
    secure: authService.refreshCookieOptions().secure,
    sameSite: 'lax',
    path: '/api/auth',
  })
}

async function signup(req, res) {
  const result = await authService.signup(req.body)
  setRefreshCookie(res, result.refreshToken)
  res.status(201).json({
    success: true,
    message: 'Signup successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

async function login(req, res) {
  const result = await authService.login(req.body)
  setRefreshCookie(res, result.refreshToken)
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

async function refresh(req, res) {
  const raw = req.cookies[authService.REFRESH_COOKIE]
  const result = await authService.refresh(raw)
  setRefreshCookie(res, result.refreshToken)
  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

async function logout(req, res) {
  const raw = req.cookies[authService.REFRESH_COOKIE]
  await authService.logout(raw)
  clearRefreshCookie(res)
  res.status(200).json({
    success: true,
    message: 'Logged out',
  })
}

async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.email)
  res.status(200).json({
    success: true,
    message: result.message,
    data: result.devOtp ? { devOtp: result.devOtp } : undefined,
  })
}

async function verifyOtp(req, res) {
  const result = await authService.verifyOtp(req.body)
  res.status(200).json({
    success: true,
    message: result.message,
    data: { resetToken: result.resetToken },
  })
}

async function resetPassword(req, res) {
  const result = await authService.resetPassword(req.body)
  clearRefreshCookie(res)
  res.status(200).json({
    success: true,
    message: result.message,
  })
}

async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.id, req.body)
  clearRefreshCookie(res)
  res.status(200).json({
    success: true,
    message: result.message,
  })
}

async function me(req, res) {
  const user = await authService.getMe(req.user.id)
  res.status(200).json({
    success: true,
    data: { user },
  })
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  me,
}
