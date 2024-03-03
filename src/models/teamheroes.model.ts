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
  tableName: 'teamheroes',
})
export class TeamHeroes extends Model {
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
  teamid: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  heroid: number

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

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  teamname: string

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
