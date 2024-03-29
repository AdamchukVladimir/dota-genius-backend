import { Controller, Post } from '@nestjs/common'
import { SqlReloaderService } from './sql_reloader.service'

@Controller('sql-reloader')
export class SqlReloaderController {
  constructor(private readonly sqlReloerService: SqlReloaderService) {}
  @Post('/heroesupdate')
  async updateHeroesVersusDB() {
    return this.sqlReloerService.updateHeroesVersusDB()
  }

  @Post('/heroeswithupdate')
  async updateHeroesWithDB() {
    return this.sqlReloerService.updateHeroesWithDB()
  }

  @Post('/playersupdate')
  async updatePlayersDB() {
    return this.sqlReloerService.updatePlayersDB()
  }

  @Post('/teamsupdate')
  async updateTeamsDB() {
    return this.sqlReloerService.updateTeamsDB()
  }

  @Post('/THupdate')
  async updateTeamHeroesDB() {
    return this.sqlReloerService.updateTeamHeroesDB()
  }

  @Post('/THVupdate')
  async updateTeamHeroesVersusDB() {
    return this.sqlReloerService.updateTeamHeroesVersusDB()
  }
}
