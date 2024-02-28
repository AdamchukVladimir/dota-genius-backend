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
