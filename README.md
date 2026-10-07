# Auth Lab

Practice project: professional Node/Express auth API + simple Next.js UI.

## Structure

```
auth-lab/
  backend/   → Express API (JWT, refresh tokens, OTP)
  frontend/  → Next.js practice UI
```

## Quick start

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

API: `http://localhost:5050` (port 5000 is often taken by macOS AirPlay)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

### Learn while building

Open `LEARNING.md` — it maps each auth concept to the real files in this repo.

## Folder map (backend)

```
backend/src/
  app.js                 → middleware order + route mount
  server.js              → start HTTP server
  config/                → env + Prisma client
  routes/auth.routes.js  → URL → controller
  controllers/           → HTTP request/response
  services/              → business logic (tokens, OTP, passwords)
  middleware/            → authenticate, validate, errors
  validators/            → Zod schemas
  utils/                 → jwt, hashing, AppError
prisma/schema.prisma     → User, RefreshToken, OtpCode
```

## Auth APIs

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/verify-otp` | Public |
| POST | `/api/auth/reset-password` | Public (needs OTP proof) |
| POST | `/api/auth/change-password` | Access token |
| POST | `/api/auth/refresh` | Refresh cookie |
| POST | `/api/auth/logout` | Refresh cookie |
| GET | `/api/auth/me` | Access token |

In development, OTPs are printed in the **backend terminal** (no real email needed).

Read `LEARNING.md` while you explore the code.
