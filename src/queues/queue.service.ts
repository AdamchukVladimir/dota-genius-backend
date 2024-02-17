import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { InjectQueue, Process } from '@nestjs/bull'
import { Queue } from 'bull'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'
import { MatchesService } from '../matches/matches.service'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('graphql-to-db') private readonly queue: Queue,
    private readonly graphqlService: GraphQLService,
    private readonly leaguesService: LeaguesService,
    //private readonly MatchesService: MatchesService,
    @Inject(forwardRef(() => MatchesService))
    private readonly MatchesService: MatchesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async addMatchByLeagueTaskToQueue(leagueId: any): Promise<void> {
    await this.queue.add('processMatchesByLeagueTask', leagueId)
  }

  @Process('processMatchesByLeagueTask')
  async processMatchesByLeagueTask(leagueId: any): Promise<void> {
    try {
      //console.log('processMatchesByLeagueTask')
      // req to stratz graphqlService
      const matches = await this.MatchesService.fetchMatchesByLeague(leagueId)
      await this.MatchesService.saveMatchesToDatabase(matches)
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' queue.service ERROR while processMatchesByLeagueTask:',
        error,
      )
    }
  }

  async addReloadMatchDetailsTaskToQueue(matchId: number): Promise<void> {
    console.log('matchId ' + matchId)
    await this.queue.add('processReloadMatchDetailsTask', matchId)
  }

  @Process('processReloadMatchDetailsTask')
  async processReloadMatchDetailsTask(matchId: number): Promise<void> {
    try {
      const matchFull = await this.MatchesService.fetchMatchDetails(matchId)
      this.logger.info(
        new Date().toLocaleString() +
          ' queue.service processReloadMatchDetailsTask. matchFull: ' +
          matchFull,
      )
      await this.MatchesService.saveMatchDetailsToDB(matchFull)
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' queue.service ERROR while processReloadMatchDetailsTask:',
        error,
      )
    }
  }

  async getQueueInfo(): Promise<any> {
    return await this.queue.getJobCounts()
  }
}
