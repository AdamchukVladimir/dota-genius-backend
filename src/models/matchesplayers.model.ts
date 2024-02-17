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
  tableName: 'matches',
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
    allowNull: false,
  })
  match_id: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  steamaccountid: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  isradiant: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isvictory: boolean

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  playerslot: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  lane: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  position: string

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  durationseconds: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  leaguetier: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  seriestype: string

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  firstbloodtime: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  nickname: string

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  teamid: number

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
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
