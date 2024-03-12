import { Controller, Get, Delete, Post } from '@nestjs/common'
import { MatchesService } from './matches.service'

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // @Get()
  // async fetchMatchesByLeague(): Promise<any> {
  //   //const matches = await this.matchesService.fetchMatchesByLeague(15960)
  //   //return matches
  // }
  @Get()
  async fetchMatchDetails(): Promise<any> {
    const matchDetails = await this.matchesService.fetchMatchDetails(7590464570)
    return matchDetails
  }
  @Get('live')
  async fetchAllLiveMatches(): Promise<any> {
    const liveMatches = await this.matchesService.fetchAllLiveMatches()
    return liveMatches
  }

  @Post()
  async processReloadMatchesDetails(): Promise<any> {
    await this.matchesService.processReloadMatchesDetails()
  }

  @Post('process')
  async processMatchesByLeagues(): Promise<any> {
    await this.matchesService.processMatchesByLeagues()
  }
}
