'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('reset_email')
    if (saved) setEmail(saved)
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ email, otp })
      sessionStorage.setItem('reset_token', res.data.resetToken)
      router.push('/reset-password')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <h1 className="brand">Verify OTP</h1>
        <p className="lead">
          If the OTP is valid, the API returns a short-lived <code>resetToken</code> used on the
          next step.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            6-digit OTP
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
            />
          </label>
          {error ? <p className="msg error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          <Link href="/forgot-password">Request a new OTP</Link>
        </p>
      </section>
    </main>
  )
}
