import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

export const metadata = {
  title: 'Auth Lab',
  description: 'Practice signup, login, OTP, and JWT refresh tokens',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
