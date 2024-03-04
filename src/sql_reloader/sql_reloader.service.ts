import { Injectable, Inject } from '@nestjs/common'
import { Sequelize } from 'sequelize-typescript'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as fs from 'fs'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file

@Injectable()
export class SqlReloaderService {
  private HEROES_AVG_UPDATE_SQL: string
  private HEROES_VERSUS_UPDATE_SQL: string
  private HEROES_WITH_UPDATE_SQL: string
  private PLAYERS_UPDATE_SQL: string
  private TEAMS_UPDATE_SQL: string
  private TEAM_HEROES_UPDATE_SQL: string
  private TEAM_HEROES_VERSUS_UPDATE_SQL: string
  private TEAM_VS_TEAM_UPDATE_SQL: string

  constructor(
    private readonly sequelize: Sequelize,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    fs.readFile('./src/SQL/queries/heroesavg.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.HEROES_AVG_UPDATE_SQL = data
    })
    fs.readFile('./src/SQL/queries/heroes.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.HEROES_VERSUS_UPDATE_SQL = data
    })
    fs.readFile('./src/SQL/queries/heroeswith.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.HEROES_WITH_UPDATE_SQL = data
    })
    fs.readFile('./src/SQL/queries/players.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.PLAYERS_UPDATE_SQL = data
    })
    fs.readFile('./src/SQL/queries/teams.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.TEAMS_UPDATE_SQL = data
    })
    fs.readFile('./src/SQL/queries/teamheroes.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.TEAM_HEROES_UPDATE_SQL = data
    })
    fs.readFile(
      './src/SQL/queries/teamheroesversus.SQL',
      'utf8',
      (err, data) => {
        if (err) {
          throw err
        }
        this.TEAM_HEROES_VERSUS_UPDATE_SQL = data
      },
    )
    fs.readFile('./src/SQL/queries/teamsvsteams.SQL', 'utf8', (err, data) => {
      if (err) {
        throw err
      }
      this.TEAM_VS_TEAM_UPDATE_SQL = data
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateHeroesAVGDB() {
    try {
      await this.sequelize.query(this.HEROES_AVG_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateHeroesAVGDB:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateHeroesWithDB() {
    try {
      await this.sequelize.query(this.HEROES_WITH_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateHeroesWithDB:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateHeroesVersusDB() {
    await this.sequelize.query(this.HEROES_VERSUS_UPDATE_SQL)
    return 'good'
  }
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updatePlayersDB() {
    await this.sequelize.query(this.PLAYERS_UPDATE_SQL)
    return 'good'
  }
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async updateTeamsDB() {
    try {
      await this.sequelize.query(this.TEAMS_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateTeamsDB:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async updateTeamHeroesDB() {
    try {
      await this.sequelize.query(this.TEAM_HEROES_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateTeamHeroesDB:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async updateTeamHeroesVersusDB() {
    try {
      await this.sequelize.query(this.TEAM_HEROES_VERSUS_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateTeamHeroesVersusDB:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async updateTeamsVSTeamsDB() {
    try {
      await this.sequelize.query(this.TEAM_VS_TEAM_UPDATE_SQL)
      return 'good'
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' sql_reloader.service Error updateTeamsVSTeamsDB:',
        error,
      )
    }
  }
}
