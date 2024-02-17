import { gql } from '@apollo/client'

export const MATCH_DETAILS_QUERY = gql`
  query Match($matchId: Long!) {
    match(id: $matchId) {
      id
      didRadiantWin
      durationSeconds
      startDateTime
      endDateTime
      firstBloodTime
      leagueId
      league {
        tier
      }
      radiantTeamId
      radiantTeam {
        name
      }
      direTeamId
      direTeam {
        name
      }
      series {
        type
      }
      players {
        steamAccountId
        isRadiant
        isVictory
        playerSlot
        lane
        position
        hero {
          id
        }
        steamAccount {
          name
        }
      }
    }
  }
`
