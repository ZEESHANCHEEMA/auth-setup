'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { loginSuccess } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'prefer_not_to_say',
    age: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.signup(form)
      loginSuccess(res.data)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <h1 className="brand">Sign up</h1>
        <p className="lead">Creates a user, hashes the password, and issues JWT + refresh cookie.</p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={onChange} required minLength={2} />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Password (min 8)
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={8}
            />
          </label>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={onChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
          <label>
            Age
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={onChange}
              required
              min={13}
              max={120}
            />
          </label>
          {error ? <p className="msg error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="hint" style={{ marginTop: 16 }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}
