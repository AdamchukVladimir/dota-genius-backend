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
  tableName: 'leagues',
})
export class League extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  league_id: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  tier: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  region: string

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startDateTime: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDateTime: Date

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
