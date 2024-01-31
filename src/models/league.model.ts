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
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  league_id: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  tier: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  region: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDateTime: Date

  @Column({
    type: DataType.DATE,
    allowNull: false,
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
