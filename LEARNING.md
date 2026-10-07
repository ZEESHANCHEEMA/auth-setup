# Learning Guide — Auth Lab

Read this while you click through the code. Each section maps to real files.

## 1. Request journey

```
Browser / Next.js
  → cors, helmet, json, cookieParser, morgan
  → /api/auth/... route
  → validate body (Zod)
  → controller → service → Prisma (SQLite)
  → JSON response
  → error middleware if something fails
```

**Files:** `backend/src/app.js`, `backend/src/server.js`

## 2. Signup

1. Validate `name`, `email`, `password`
2. Reject if email already exists
3. Hash password with **bcrypt** (never store plain text)
4. Save user
5. Issue **access JWT** + **refresh token**

**Files:** `controllers/auth.controller.js` → `services/auth.service.js`

## 3. Login

1. Find user by email
2. `bcrypt.compare(password, hash)`
3. Same token issuance as signup

## 4. Access token vs refresh token

| | Access | Refresh |
|---|--------|---------|
| Lifetime | ~15 minutes | ~7 days |
| Sent as | `Authorization: Bearer ...` | httpOnly cookie |
| Stored | Client memory / localStorage (demo) | Server DB (hashed) + cookie |
| Purpose | Call APIs | Get a new access token |

**Files:** `utils/tokens.js`, `middleware/authenticate.js`

## 5. Refresh flow

1. Access token expires → API returns 401
2. Frontend calls `POST /api/auth/refresh` (cookie goes automatically)
3. Server checks refresh token in DB, not expired, not revoked
4. **Rotates** refresh token (old one invalidated)
5. Returns new access token

## 6. Forgot password + OTP

1. `forgot-password` → create 6-digit OTP, hash it, save with expiry
2. In learning mode → OTP logged in terminal
3. `verify-otp` → check code → return short-lived `resetToken`
4. `reset-password` → use `resetToken` + new password

**Why hash OTP?** Same reason as passwords — DB leak should not reveal codes.

## 7. Change password (logged in)

1. Requires valid access token
2. Verify current password
3. Hash and save new password
4. Optionally revoke all refresh tokens (we do this for safety)

## 8. Middleware order (why it matters)

1. `helmet` / `cors` — headers & browser access
2. `express.json` — fill `req.body`
3. `cookieParser` — fill `req.cookies`
4. `morgan` — log request
5. Routes (+ `authenticate` on protected ones)
6. Error handler **last**

## 9. Frontend role

Next.js pages call the API. Access token lives in memory/localStorage for the demo; refresh cookie is httpOnly so JS cannot read it (safer).

**Files:** `frontend/lib/api.js`, pages under `frontend/app/`
