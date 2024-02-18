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
  tableName: 'matchesplayers',
})
export class MatchesPlayers extends Model {
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
  match_id: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  hero_id: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  steamaccountid: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  isradiant: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isvictory: boolean

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  playerslot: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  lane: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  position: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  durationseconds: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  leaguetier: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  seriestype: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  firstbloodtime: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  nickname: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  teamid: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  startdatetime: number

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
