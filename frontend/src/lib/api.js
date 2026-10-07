const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'

/**
 * Thin fetch wrapper for the Express API.
 * credentials: 'include' sends the httpOnly refresh cookie.
 */
export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export const authApi = {
  signup: (body) => api('/api/auth/signup', { method: 'POST', body }),
  login: (body) => api('/api/auth/login', { method: 'POST', body }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
  refresh: () => api('/api/auth/refresh', { method: 'POST' }),
  me: (token) => api('/api/auth/me', { token }),
  forgotPassword: (body) => api('/api/auth/forgot-password', { method: 'POST', body }),
  verifyOtp: (body) => api('/api/auth/verify-otp', { method: 'POST', body }),
  resetPassword: (body) => api('/api/auth/reset-password', { method: 'POST', body }),
  changePassword: (body, token) =>
    api('/api/auth/change-password', { method: 'POST', body, token }),
}
