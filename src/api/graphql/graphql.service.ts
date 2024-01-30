import { Injectable, Inject } from '@nestjs/common'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { FETCH_LEAGUES_QUERY } from './queries/leagues'
import { Token } from './token/token.model'
import { League } from './models/league.model'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Injectable()
export class GraphQLService {
  private apolloClient: ApolloClient<InMemoryCache>
  private authToken: string

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.authToken = ''

    this.initializeApolloClient()
  }

  private async initializeApolloClient() {
    this.authToken = await this.getTokenFromDB()

    const cache = new InMemoryCache() as any // Fix ts type problem
    this.apolloClient = new ApolloClient({
      uri: 'https://api.stratz.com/graphql',
      cache: cache,
      headers: {
        Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
      },
    })
  }

  private async getTokenFromDB(): Promise<string> {
    try {
      const tokenEntry = await Token.findOne({
        attributes: ['token'],
        where: {
          name: 'stratz',
        },
      })

      if (tokenEntry) {
        return tokenEntry.token
      } else {
        this.logger.error('Token entry not found in the database.')
        return ''
      }
    } catch (error) {
      this.logger.error('Error while querying the database:', error)
      return ''
    }
  }

  async fetchLeaguesAndSaveToDatabase(): Promise<any> {
    // get data by query
    const result = await this.apolloClient.query({
      query: FETCH_LEAGUES_QUERY,
    })

    const leagues = result.data.leagues

    // Save leagues to the database
    await this.saveLeaguesToDatabase(leagues)

    return leagues
  }

  private async saveLeaguesToDatabase(leagues: any[]): Promise<void> {
    try {
      for (const league of leagues) {
        const [createdLeague, created] = await League.findOrCreate({
          where: { league_id: league.id },
          defaults: {
            tier: league.tier,
            region: league.region,
            startDateTime: new Date(league.startDateTime * 1000), //get date from unix date
            endDateTime: new Date(league.endDateTime * 1000),
          },
        })
        if (!created) {
          this.logger.info(
            `League with league_id ${league.id} already exists. Skipping.`,
          )
        }
      }
    } catch (error) {
      this.logger.error('Error while saving leagues to the database:', error)
    }
  }
}
