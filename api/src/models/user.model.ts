import {
  Table, Column, Model, DataType, PrimaryKey, Default, Unique, AllowNull,
  HasMany, ForeignKey, BelongsTo, BeforeSave
} from 'sequelize-typescript'
import bcrypt from 'bcrypt'
import { env } from '../config/env'
import { RefreshToken } from './refresh-token.model'

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare parentId: string | null

  @BelongsTo(() => User, 'parentId')
  parent?: User

  @HasMany(() => User, 'parentId')
  children?: User[]

  @HasMany(() => RefreshToken)
  refreshTokens?: RefreshToken[]

  @BeforeSave
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      instance.password = await bcrypt.hash(instance.password, env.BCRYPT_SALT_ROUNDS)
    }
  }

  async checkPassword(raw: string) {
    return bcrypt.compare(raw, this.password)
  }
}
