import { Request, Response } from 'express'
import { col, Op, WhereOptions } from 'sequelize'
import { User } from '../models/user.model'
import { sequelize } from '../db/sequelize'
import { RefreshToken } from '../models/refresh-token.model'


export async function listUsers(req: Request, res: Response) {
  const qv = (req.validated?.query ?? {}) as any

  const page = Number(qv.page ?? 1)
  const limit = Number(qv.limit ?? 10)
  const sortBy = (qv.sortBy ?? 'createdAt') as 'createdAt' | 'email' | 'name'
  const order = String(qv.order ?? 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
  const q = qv.q as string | undefined
  const parentId = qv.parentId as string | undefined

  const where: WhereOptions = {}
  if (q) Object.assign(where, { [Op.or]: [{ email: { [Op.iLike]: `%${q}%` } }, { name: { [Op.iLike]: `%${q}%` } }] })
  if (parentId) Object.assign(where, { parentId })

  // createdAt alanı için güvenli kolon adı (underscored: created_at)
  const orderCol = sortBy === 'createdAt' ? col('created_at') : col(sortBy)

  const offset = (page - 1) * limit
  const { rows, count } = await User.findAndCountAll({
    where,
    offset,
    limit,
    order: [[orderCol, order]],
    attributes: { exclude: ['password'] },
    include: [{ model: User, as: 'children', attributes: { exclude: ['password'] } }],
  })

  res.json({ data: rows, meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) } })
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: User, as: 'children', attributes: { exclude: ['password'] } }],
  })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

export async function createUser(req: Request, res: Response) {
  const { email, name, password, parentId } = req.body
  const exists = await User.findOne({ where: { email } })
  if (exists) return res.status(409).json({ message: 'Email already in use' })
  const user = await User.create({ email, name, password, parentId: parentId ?? null })
  const plain = user.toJSON() as any
  delete plain.password
  res.status(201).json(plain)
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const { email, name, password, parentId } = req.body
  if (email) user.email = email
  if (name) user.name = name
  if (typeof parentId !== 'undefined') user.parentId = parentId
  if (password) user.password = password // hook hash'ler
  await user.save()

  const plain = user.toJSON() as any
  delete plain.password
  res.json(plain)
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params

  try {
    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    await sequelize.transaction(async (t) => {
      // 1) Bu kullanıcının çocuklarını kopar
      await User.update({ parentId: null }, { where: { parentId: id }, transaction: t })
      // 2) Refresh tokenlarını temizle
      await RefreshToken.destroy({ where: { userId: id }, transaction: t })
      // 3) Kullanıcıyı sil
      await User.destroy({ where: { id }, transaction: t })
    })

    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to delete user' })
  }
}
