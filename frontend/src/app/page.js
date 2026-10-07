'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/dashboard')
  }, [loading, isAuthenticated, router])

  return (
    <main className="shell">
      <section className="card">
        <h1 className="brand">Auth Lab</h1>
        <p className="lead">
          Practice backend auth: signup, login, forgot password, OTP, change password,
          and refresh tokens — with a small Next.js UI.
        </p>
        <div className="row">
          <Link href="/signup">
            <button type="button">Create account</button>
          </Link>
          <Link href="/login">
            <button type="button" className="secondary">
              Log in
            </button>
          </Link>
        </div>
        <p className="hint" style={{ marginTop: 18 }}>
          Tip: keep the backend terminal open — OTPs are printed there in development.
        </p>
      </section>
    </main>
  )
}
