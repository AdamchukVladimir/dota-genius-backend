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
  tableName: 'players',
})
export class Players extends Model {
  // @PrimaryKey
  // @AutoIncrement
  // @Column({
  //   type: DataType.BIGINT,
  //   allowNull: true,
  // })
  // id: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  steamaccountid: number

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  nickname: number

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
  position_1_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_1_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_2_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_2_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_3_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_3_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_4_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_4_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_5_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  position_5_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  safe_lane_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  safe_lane_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  mid_lane_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  mid_lane_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  off_lane_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  off_lane_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiant_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiant_matcheswin: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dire_matchescount: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dire_matcheswin: number

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
