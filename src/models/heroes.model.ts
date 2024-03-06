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
  tableName: 'heroes',
})
export class Heroes extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  id: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  hero1: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  hero2: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  firstbloodtime_avg: number

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
