import { gql } from '@apollo/client'

export const FETCH_LEAGUES_QUERY = gql`
  query Leagues($startDateTime: Long!, $skip: Int!, $take: Int!) {
    leagues(
      request: { skip: $skip, take: $take, startDateTime: $startDateTime }
    ) {
      id
      tier
      region
      startDateTime
      endDateTime
    }
  }
`
