'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authApi } from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setDevOtp('')
    setLoading(true)
    try {
      const res = await authApi.forgotPassword({ email })
      setMessage(res.message)
      if (res.data?.devOtp) setDevOtp(res.data.devOtp)
      sessionStorage.setItem('reset_email', email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <h1 className="brand">Forgot password</h1>
        <p className="lead">
          Sends a 6-digit OTP. In learning mode it is printed in the backend terminal (and shown
          below in development).
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
          {error ? <p className="msg error">{error}</p> : null}
          {message ? <p className="msg ok">{message}</p> : null}
          {devOtp ? (
            <p className="msg ok">
              Dev OTP: <code>{devOtp}</code>
            </p>
          ) : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
          {message ? (
            <button type="button" className="secondary" onClick={() => router.push('/verify-otp')}>
              Continue to verify OTP
            </button>
          ) : null}
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          <Link href="/login">Back to login</Link>
        </p>
      </section>
    </main>
  )
}
