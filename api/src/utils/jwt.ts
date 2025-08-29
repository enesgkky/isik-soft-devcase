import * as jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { randomUUID } from 'crypto'

export type JwtAccessPayload = { sub: string; email: string; type: 'access' }
export type JwtRefreshPayload = { sub: string; jti: string; type: 'refresh'; exp: number }

export function signAccessToken(user: { id: string; email: string }) {
  const payload: JwtAccessPayload = { sub: user.id, email: user.email, type: 'access' }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as jwt.Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(userId: string, jti?: string) {
  const payload = { sub: userId, jti: jti ?? randomUUID(), type: 'refresh' }
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
  return { token, jti: payload.jti }
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as jwt.Secret) as jwt.JwtPayload & JwtAccessPayload
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as jwt.JwtPayload & JwtRefreshPayload
}
