'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('reset_token')
    if (token) setResetToken(token)
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await authApi.resetPassword({ resetToken, newPassword })
      setMessage(res.message)
      sessionStorage.removeItem('reset_token')
      sessionStorage.removeItem('reset_email')
      setTimeout(() => router.push('/login'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <h1 className="brand">Reset password</h1>
        <p className="lead">Uses the resetToken from OTP verification to set a new password.</p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            New password (min 8)
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          {!resetToken ? (
            <p className="msg error">Missing reset token. Verify OTP first.</p>
          ) : null}
          {error ? <p className="msg error">{error}</p> : null}
          {message ? <p className="msg ok">{message}</p> : null}
          <button type="submit" disabled={loading || !resetToken}>
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          <Link href="/login">Back to login</Link>
        </p>
      </section>
    </main>
  )
}
