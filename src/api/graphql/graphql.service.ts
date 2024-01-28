import { Injectable } from '@nestjs/common'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { FETCH_LEAGUES_QUERY } from './queries/leagues'

@Injectable()
export class GraphQLService {
  private apolloClient: ApolloClient<InMemoryCache>
  private readonly authToken: string

  constructor() {
    //get STRATZ_BEARER_TOKEN from env
    //this.authToken = this.configService.get<string>('STRATZ_BEARER_TOKEN') || ''
    this.authToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiYWU4MDk5YmEtNTUzMy00NmUxLWI5ZDEtNWQyOWU4YjYxZjJkIiwiU3RlYW1JZCI6IjI0Mzk5NTE2NyIsIm5iZiI6MTY5MTM0MDQzOCwiZXhwIjoxNzIyODc2NDM4LCJpYXQiOjE2OTEzNDA0MzgsImlzcyI6Imh0dHBzOi8vYXBpLnN0cmF0ei5jb20ifQ.WyEjOdMVyfxPUJRM_cv2ofP_Du7ZS1ZkED5qRDUz1uo'
    const cache = new InMemoryCache() as any // Fix ts type problem
    this.apolloClient = new ApolloClient({
      //  Apollo Client
      uri: 'https://api.stratz.com/graphql',
      cache: cache, // use const cache fix type problem
      headers: {
        // Add Bearer token to headers
        Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
      },
    })
  }

  async fetchLeagues(): Promise<any> {
    // get data by query
    const result = await this.apolloClient.query({
      query: FETCH_LEAGUES_QUERY, //The request has been moved to a separate file in folder queries
    })

    return result.data
  }
}
