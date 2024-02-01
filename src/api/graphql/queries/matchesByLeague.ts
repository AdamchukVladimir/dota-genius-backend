import { gql } from '@apollo/client'

export const FETCH_MATCHES_BY_LEAGUE_QUERY = gql`
  query League($leagueId: Int!, $skip: Int!, $take: Int!) {
    league(id: $leagueId) {
      matches(request: { skip: $skip, take: $take }) {
        id
      }
    }
  }
`
