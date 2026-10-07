const { z } = require('zod')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Valid email required').toLowerCase(),
  password: passwordSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender must be male, female, other, or prefer_not_to_say',
  }),
  age: z.coerce.number().int().min(13, 'Must be at least 13').max(120, 'Age looks invalid'),
})

const loginSchema = z.object({
  email: z.string().trim().email('Valid email required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Valid email required').toLowerCase(),
})

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Valid email required').toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
}
