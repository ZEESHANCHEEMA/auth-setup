const express = require('express')
const authController = require('../controllers/auth.controller')
const { asyncHandler } = require('../utils/asyncHandler')
const { validate } = require('../middleware/validate')
const { authenticate } = require('../middleware/authenticate')
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/auth.validators')

const router = express.Router()

// Public
router.post('/signup', validate(signupSchema), asyncHandler(authController.signup))
router.post('/login', validate(loginSchema), asyncHandler(authController.login))
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword))
router.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp))
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword))
router.post('/refresh', asyncHandler(authController.refresh))
router.post('/logout', asyncHandler(authController.logout))

// Protected (needs access JWT)
router.get('/me', authenticate, asyncHandler(authController.me))
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
)

module.exports = router
