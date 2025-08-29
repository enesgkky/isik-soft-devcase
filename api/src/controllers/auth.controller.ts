import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { RefreshToken } from '../models/refresh-token.model'
import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/jwt'

export async function register(req: Request, res: Response) {
  const { email, name, password, parentId } = req.body
  const existing = await User.findOne({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email already in use' })

  const user = await User.create({ email, name, password, parentId: parentId ?? null })

  const accessToken = signAccessToken({ id: user.id, email: user.email })
  const { token: refreshToken, jti } = signRefreshToken(user.id)
  const payload = verifyRefresh(refreshToken)

  await RefreshToken.create({
    jti,
    userId: user.id,
    revoked: false,
    expiresAt: new Date(payload.exp * 1000),
  })

  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, parentId: user.parentId },
    tokens: { accessToken, refreshToken },
  })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  const user = await User.findOne({ where: { email } })
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const accessToken = signAccessToken({ id: user.id, email: user.email })
  const { token: refreshToken, jti } = signRefreshToken(user.id)
  const payload = verifyRefresh(refreshToken)

  await RefreshToken.create({
    jti,
    userId: user.id,
    revoked: false,
    expiresAt: new Date(payload.exp * 1000),
  })

  res.json({
    user: { id: user.id, email: user.email, name: user.name, parentId: user.parentId },
    tokens: { accessToken, refreshToken },
  })
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body
  console.log(req.user);
  try {
    const payload = verifyRefresh(refreshToken)
    const tokenRow = await RefreshToken.findOne({ where: { jti: payload.jti, userId: payload.sub } })
    if (!tokenRow || tokenRow.revoked) return res.status(401).json({ message: 'Refresh token revoked or missing' })
    if (tokenRow.expiresAt.getTime() < Date.now()) return res.status(401).json({ message: 'Refresh token expired' })

    // rotate (eskiyi revoke et, yenisini üret)
    tokenRow.revoked = true
    await tokenRow.save()

    const { token: newRefresh, jti } = signRefreshToken(payload.sub)
    const newPayload = verifyRefresh(newRefresh)

    await RefreshToken.create({
      jti,
      userId: payload.sub,
      revoked: false,
      expiresAt: new Date(newPayload.exp * 1000),
    })

    const user = await User.findByPk(payload.sub)
    if (!user) return res.status(401).json({ message: 'User no longer exists' })

    const accessToken = signAccessToken({ id: user.id, email: user.email })
    res.json({ accessToken, refreshToken: newRefresh })
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' })
  try {
    const payload = verifyRefresh(refreshToken)
    await RefreshToken.update({ revoked: true }, { where: { jti: payload.jti, userId: payload.sub } })
    res.json({ success: true })
  } catch {
    res.status(400).json({ message: 'Invalid token' })
  }
}
