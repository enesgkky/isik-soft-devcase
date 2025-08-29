import 'reflect-metadata'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

export function createApp() {
  const app = express()
  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/health', (_req, res) => res.json({ ok: true }))
  app.use('/auth', authRoutes)
  app.use('/users', userRoutes)

  app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  })

  return app
}
