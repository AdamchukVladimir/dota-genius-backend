import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'

@Table({
  tableName: 'users_tg',
})
export class UserTG extends Model {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  chatId: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  username: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  notificatianOn: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isBanned: boolean

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  banReason: string

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: Date

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: Date
}
