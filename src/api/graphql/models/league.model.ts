import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
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
}
