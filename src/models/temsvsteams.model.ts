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
  tableName: 'teams_vs_teams',
})
export class TeamsVsTeams extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  id: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  team1id: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  team1name: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  team2id: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  team2name: string

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
