import { Injectable } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as fs from 'fs'

@Injectable()
export class SqlReloaderService {
  private HEROES_VERSUS_UPDATE_SQL: string

  constructor(private readonly sequelize: Sequelize) {
    fs.readFile('./src/SQL/queries/heroes.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.HEROES_VERSUS_UPDATE_SQL = data
    })
  }
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateHeroesVersusDB() {
    await this.sequelize.query(this.HEROES_VERSUS_UPDATE_SQL)
    return 'good'
  }
}
