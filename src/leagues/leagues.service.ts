import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule' // Cron scheduler
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_LEAGUES_QUERY } from '../api/graphql/queries/leagues'
import { League } from '../models/league.model'
import { Op } from 'sequelize'

@Injectable()
export class LeaguesService {
  constructor(
    private readonly graphQLService: GraphQLService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchLeaguesAndSaveToDatabase(): Promise<any> {
    try {
      // Ensure the Apollo client is initialized
      await this.graphQLService.initializeApolloClient()

      // Get leagues data by query
      const leagues = await this.fetchLeagues()

      // Save leagues to the database
      await this.saveLeaguesToDatabase(leagues)
      return leagues
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' leagues.service ERROR fetchLeaguesAndSaveToDatabase:',
        error,
      )
    }
  }

  async fetchLeagues(): Promise<any> {
    try {
      let allLeagues: any[] = []
      let leagues
      let skipCounter = 0
      let dateShift =
        60 * 60 * 24 * 30 * 1000 * Number(process.env.DATA_DURATION_MONTHS) ||
        60 * 60 * 24 * 30 * 2 * 1000

      let startDateTime = Math.floor((new Date().getTime() - dateShift) / 1000)
      console.log('startDateTime ' + startDateTime)
      console.log('dateShift ' + dateShift)
      do {
        const result = await this.graphQLService.apolloClient.query({
          query: FETCH_LEAGUES_QUERY,
          variables: {
            startDateTime: startDateTime,
            skip: skipCounter,
            take: 100,
          },
          fetchPolicy: 'no-cache', // fix cache overload
        })
        leagues = result.data.leagues
        allLeagues.push(...leagues)
        skipCounter += 100
      } while (leagues.length == 100)
      return allLeagues
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() + ` leagues.service Error fetchLeagues:`,
        error,
      )
      return []
    }
  }

  private async saveLeaguesToDatabase(leagues: any[]): Promise<void> {
    try {
      for (const league of leagues) {
        await League.upsert({
          league_id: league.id,
          tier: league.tier,
          region: league.region,
          startDateTime: new Date(league.startDateTime * 1000),
          endDateTime: new Date(league.endDateTime * 1000),
        })
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' leagues.service ERROR saveLeaguesToDatabase:',
        error,
      )
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteOldLeaguesFromDB(): Promise<void> {
    try {
      // calculate date two month ago
      const MonthsAgo = new Date()
      let monthToSubtract = Number(process.env.DATA_DURATION_MONTHS || 2) //get months from env
      MonthsAgo.setMonth(MonthsAgo.getMonth() - monthToSubtract) //two month ago

      // DElETE where endDateTime before MonthsAgo
      await League.destroy({
        where: {
          endDateTime: {
            [Op.lt]: MonthsAgo,
          },
        },
      })

      this.logger.info(
        new Date().toLocaleString() +
          ' leagues.service Old leagues deleted successfully.',
      )
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' leagues.service ERROR deleteOldLeaguesFromDB:',
        error,
      )
    }
  }

  async getLeaguesFromDB(): Promise<any[]> {
    try {
      const leagues = await League.findAll()
      return leagues
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' leagues.service ERROR getLeaguesFromDB:',
        error,
      )
      return []
    }
  }
}
