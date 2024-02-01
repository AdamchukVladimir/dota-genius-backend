import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_MATCHES_BY_LEAGUE_QUERY } from '../api/graphql/queries/matchesByLeague'
import { League } from '../models/league.model'
import { Op } from 'sequelize'
import { LeaguesService } from '../leagues/leagues.service'

@Injectable()
export class MatchesService {
  //   private skipCounter: number = 0
  //   private takeCounter: number = 100

  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly graphQLService: GraphQLService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  //   @Cron(CronExpression.EVERY_5_MINUTES)
  //   async processMatches(): Promise<void> {
  //     try {
  //       const leagues = await this.leaguesService.getLeaguesFromDB()

  //       for (const league of leagues) {
  //         const matches = await this.fetchMatchesByLeague(league.league_id)
  //         await this.saveMatchesToDatabase(matches)
  //       }

  //       // Reset Counter after  finish
  //       this.resetCounters()
  //     } catch (error) {
  //       this.logger.error('Error processing matches:', error)
  //     }
  //   }

  //async fetchMatchesByLeague(leagueId: number): Promise<any[]> {
  async fetchMatchesByLeague(): Promise<any[]> {
    const leagueId = 15960
    try {
      let allMatches: any[] = []
      let matches
      let skipCounter = 0
      do {
        const result = await this.graphQLService.apolloClient.query({
          query: FETCH_MATCHES_BY_LEAGUE_QUERY,
          variables: {
            leagueId,
            skip: skipCounter,
            take: 100,
          },
        })
        matches = result.data.league.matches
        allMatches.push(...matches)
        skipCounter += 101
      } while (matches.length == 100)
      return allMatches
    } catch (error) {
      this.logger.error(`Error fetching matches for league ${leagueId}:`, error)
      return []
    }
  }

  private async saveMatchesToDatabase(matches: any[]): Promise<void> {
    // Здесь вставьте логику сохранения матчей в базу данных
  }

  //   private resetCounters(): void {
  //     this.skipCounter = 0
  //     this.takeCounter = 100
  //   }
}
