import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import auth from './lib/auth.js'
import instagramRoutes from './routes/instagram.routes.js'
import aiRoutes from './routes/ai.routes.js'
import reportRoutes from './routes/report.route.js'
import deepAnalysisRoutes from './routes/deepAnalysis.routes.js'

const app = express()
const PORT = process.env.PORT || 5001

// frontend connection
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

// Serve downloaded media files as static
app.use('/media', express.static('public/media'))

// better auth routes
app.all('/api/auth/*splat', toNodeHandler(auth))

// instagram scraping routes
app.use('/api/ig', instagramRoutes)

// ai analysis routes
app.use('/api/ai', aiRoutes)

// deep analysis routes
app.use('/api/deep-analysis', deepAnalysisRoutes)

// check health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/report', reportRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})