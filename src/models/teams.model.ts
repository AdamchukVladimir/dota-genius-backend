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
  tableName: 'teams',
})
export class Team extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  teamid: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  teamname: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiantmatchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiantmatcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dirematchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dirematcheswin: number

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
