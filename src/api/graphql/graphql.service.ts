import { Injectable, Inject } from '@nestjs/common'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Token } from './token/token.model'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston' // logger to file

@Injectable()
export class GraphQLService {
  apolloClient: ApolloClient<InMemoryCache>
  private authToken: string

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.authToken = ''

    this.initializeApolloClient()
  }

  async initializeApolloClient() {
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
        this.logger.error(
          new Date() + ' ERROR Token entry not found in the database.',
        )
        return ''
      }
    } catch (error) {
      this.logger.error(
        new Date() + ' ERROR while querying the database:',
        error,
      )
      return ''
    }
  }
}
