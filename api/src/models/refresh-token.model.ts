import {
  Table, Column, Model, DataType, Default, PrimaryKey, ForeignKey, BelongsTo,
  AllowNull, Index
} from 'sequelize-typescript'
import { User } from './user.model'

@Table({ tableName: 'refresh_tokens' })
export class RefreshToken extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string

  @Index({ unique: true })
  @AllowNull(false)
  @Column(DataType.STRING)
  declare jti: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare revoked: boolean

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expiresAt: Date

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string

  @BelongsTo(() => User)
  user?: User
}
