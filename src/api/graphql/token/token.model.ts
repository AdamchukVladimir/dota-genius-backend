import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'

@Table({
  tableName: 'tokens',
})
export class Token extends Model {
  @Column({
    type: 'VARCHAR(255)', // Это определение типа поля в SQL
    allowNull: false,
  })
  name: string

  @Column({
    type: 'TEXT', // Это определение типа поля в SQL
    allowNull: false,
  })
  token: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date
}
