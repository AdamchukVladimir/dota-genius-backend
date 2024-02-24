import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_LIVE_QUERY } from '../api/graphql/queries/live'

@Injectable()
export class PredictionService {
  constructor(
    private readonly graphQLService: GraphQLService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async fetchAllLiveMatches(): Promise<any> {
    try {
      let liveMatches
      liveMatches = await this.graphQLService.apolloClient.query({
        query: FETCH_LIVE_QUERY,
      })
      return liveMatches
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service fetchAllLiveMatches Error :`,
        error,
      )
    }
  }
}
