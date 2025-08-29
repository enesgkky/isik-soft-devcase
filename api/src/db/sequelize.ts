import { Sequelize } from 'sequelize-typescript'
import { env } from '../config/env'
import { User } from '../models/user.model'
import { RefreshToken } from '../models/refresh-token.model'

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  models: [User, RefreshToken],
  define: { underscored: true },
})
