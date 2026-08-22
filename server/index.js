/* eslint-env node */
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './config/db.js'
import studentRoutes from './routes/students.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/students', studentRoutes)

app.use((err, _req, res, next) => {
  void next
  console.error(err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
