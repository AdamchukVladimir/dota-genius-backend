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
export class Match extends Model {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  match_id: number

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  didradiantwin: boolean

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  durationseconds: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  startdatetime: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  firstbloodtime: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  leaguetier: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  leagueid: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiantteamid: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  radiantteamname: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direteamid: number

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  direteamname: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  seriestype: string

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radianthero1: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radianthero2: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radianthero3: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radianthero4: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radianthero5: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direhero1: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direhero2: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direhero3: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direhero4: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  direhero5: number

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
