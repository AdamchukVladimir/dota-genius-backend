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
  tableName: 'predictions',
})
export class Predictions extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  match_id: number

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  did_radiant_win: boolean

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  start_date_time: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  radiant_team_id: number

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  dire_team_id: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_heroes: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_heroes_sides: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_heroes_with: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_heroes_with_sides: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_positions: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_team_heroes: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_team_vs_team: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_players: number

  @Column({
    type: DataType.REAL,
    allowNull: true,
  })
  prediction_result: number

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
