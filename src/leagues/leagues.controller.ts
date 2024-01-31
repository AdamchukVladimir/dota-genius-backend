import { Controller, Get, Delete } from '@nestjs/common'
import { LeaguesService } from './leagues.service'

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  async fetchAndSaveLeagues(): Promise<any> {
    const leagues = await this.leaguesService.fetchLeaguesAndSaveToDatabase()
    return { leagues }
  }
  @Delete()
  async deleteOldLeagues(): Promise<any> {
    const leagues = await this.leaguesService.deleteOldLeaguesFromDB()
    return { leagues }
  }
}
