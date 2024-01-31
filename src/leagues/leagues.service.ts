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
    // get data by query
    try {
      // Ensure the Apollo client is initialized
      await this.graphQLService.initializeApolloClient()

      // Get leagues data by query
      const result = await this.graphQLService.apolloClient.query({
        query: FETCH_LEAGUES_QUERY,
      })
      const leagues = result.data.leagues

      // Save leagues to the database
      await this.saveLeaguesToDatabase(leagues)
      return leagues //Потом сделаю возврат данных
    } catch (error) {
      this.logger.error(
        new Date() + ' ERROR while fetching and saving leagues:',
        error,
      )
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
        new Date() + ' ERROR while saving leagues to the database:',
        error,
      )
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteOldLeaguesFromDB(): Promise<void> {
    try {
      // calculate date two month ago
      const twoMonthsAgo = new Date()
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2) //two month ago

      // DElETE where endDateTime before twoMonthsAgo
      await League.destroy({
        where: {
          endDateTime: {
            [Op.lt]: twoMonthsAgo,
          },
        },
      })

      this.logger.info(new Date() + ' Old leagues deleted successfully.')
    } catch (error) {
      this.logger.error(
        new Date() + ' ERROR while deleting old leagues:',
        error,
      )
    }
  }
}
