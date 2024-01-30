import { gql } from '@apollo/client'

export const FETCH_LEAGUES_QUERY = gql`
  {
    leagues(request: { skip: 0, take: 100, startDateTime: 1698513403 }) {
      id
      tier
      region
      startDateTime
      endDateTime
    }
  }
`
