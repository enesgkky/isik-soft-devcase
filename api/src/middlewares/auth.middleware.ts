import { Request, Response, NextFunction } from 'express'
import { verifyAccess } from '../utils/jwt'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' })
  }
  const token = auth.slice(7)
  try {
    const payload = verifyAccess(token)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
