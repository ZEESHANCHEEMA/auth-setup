const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { env } = require('./config/env')
const authRoutes = require('./routes/auth.routes')
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler')

const app = express()

// --- Global middleware (order matters) ---
app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true, // allow refresh cookie from Next.js
  })
)
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Auth Lab API is running' })
})

// Routes
app.use('/api/auth', authRoutes)

// 404 + error handlers last
app.use(notFoundHandler)
app.use(errorHandler)

module.exports = { app }
