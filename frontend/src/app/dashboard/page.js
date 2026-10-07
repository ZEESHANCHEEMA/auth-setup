'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const router = useRouter()
  const { user, accessToken, loading, isAuthenticated, logout, loginSuccess } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [refreshNote, setRefreshNote] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  async function onChangePassword(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    setBusy(true)
    try {
      const res = await authApi.changePassword(form, accessToken)
      setMsg(res.message)
      await logout()
      router.push('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function onRefresh() {
    setRefreshNote('')
    setError('')
    try {
      const res = await authApi.refresh()
      loginSuccess(res.data)
      setRefreshNote('New access token issued via refresh cookie.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function onLogout() {
    await logout()
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <main className="shell">
        <p className="hint">Loading session…</p>
      </main>
    )
  }

  return (
    <main className="shell" style={{ alignContent: 'start', paddingTop: 40 }}>
      <div className="nav">
        <div>
          <h1 className="brand" style={{ fontSize: '1.5rem' }}>
            Dashboard
          </h1>
          <p className="hint">Signed in as {user.email}</p>
        </div>
        <button type="button" className="secondary" onClick={onLogout}>
          Log out
        </button>
      </div>

      <section className="panel grid-2">
        <div>
          <h2 style={{ marginTop: 0 }}>Your profile</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p className="hint">
            Access token is stored in localStorage for this demo. Refresh token is an httpOnly
            cookie on path <code>/api/auth</code>.
          </p>
          <div className="row" style={{ marginTop: 16 }}>
            <button type="button" onClick={onRefresh}>
              Test refresh token
            </button>
            <Link href="/">Home</Link>
          </div>
          {refreshNote ? <p className="msg ok">{refreshNote}</p> : null}
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>Change password</h2>
          <p className="hint">
            Protected route: needs Bearer access token. Also revokes all refresh tokens.
          </p>
          <form className="form" onSubmit={onChangePassword}>
            <label>
              Current password
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                minLength={8}
              />
            </label>
            {error ? <p className="msg error">{error}</p> : null}
            {msg ? <p className="msg ok">{msg}</p> : null}
            <button type="submit" disabled={busy}>
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
