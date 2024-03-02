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
  tableName: 'heroes_avg',
})
export class HeroesAVG extends Model {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  hero_id: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  matches_count: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  matches_win: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiant_matches_count: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiant_matches_win: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dire_matches_count: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dire_matches_win: number

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
