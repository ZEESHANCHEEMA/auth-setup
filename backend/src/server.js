const { app } = require('./app')
const { env } = require('./config/env')
const { prisma } = require('./config/db')

async function start() {
  try {
    await prisma.$connect()
    app.listen(env.port, () => {
      console.log(`\n🚀 Auth Lab API → http://localhost:${env.port}`)
      console.log(`   Health        → http://localhost:${env.port}/health`)
      console.log(`   Auth routes   → http://localhost:${env.port}/api/auth\n`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
