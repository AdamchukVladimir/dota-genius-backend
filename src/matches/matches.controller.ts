import { Controller, Get, Delete } from '@nestjs/common'
import { MatchesService } from './matches.service'

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async fetchMatchesByLeague(): Promise<any> {
    const matches = await this.matchesService.fetchMatchesByLeague()
    return matches
  }
}
