import { gql } from '@apollo/client'

export const FETCH_LIVE_QUERY = gql`
  query Live {
    live {
      matches(
        request: {
          skip: 0
          take: 5
          # tiers: [
          #  UNSET
          #  PROFESSIONAL
          #  AMATEUR
          #  MINOR
          #  MAJOR
          #  INTERNATIONAL
          #  DPC_QUALIFIER
          #  DPC_LEAGUE_QUALIFIER
          #  DPC_LEAGUE
          #  DPC_LEAGUE_FINALS
          # ]
          isCompleted: false
        }
      ) {
        matchId
        league {
          id
          name
          displayName
          basePrizePool
          prizePool

          tier
        }
        gameState
        radiantScore
        direScore
        delay
        spectators
        averageRank
        radiantLead
        lobbyType
        serverSteamId
        completed
        radiantTeamId
        direTeamId
        gameMode
        gameState
        gameMinute
        gameTime
        createdDateTime
        players {
          heroId
          hero {
            name
            displayName
          }
          name
          steamAccountId
          isRadiant
          numLastHits
          networth
          numKills
          numDeaths
          numAssists
          position
          steamAccount {
            profileUri
            avatar
            name
            proSteamAccount {
              name
              realName
              romanizedRealName
              isPro
              roles
              signatureHeroes
              team {
                name
                tag
                logo
                winCount
                lossCount
              }
            }
          }
        }
        playbackData {
          pickBans {
            isPick
            heroId
            order
            bannedHeroId
            isRadiant
            baseWinRate
            adjustedWinRate
            position
          }
        }
        gameState
        gameMinute
        radiantTeam {
          id
          name
          tag
          dateCreated
          isPro
          isLocked
          countryCode
          url
          logo
          baseLogo
          bannerLogo
          winCount
          lossCount
          lastMatchDateTime
          countryName
        }
        direTeam {
          id
          name
          tag
          dateCreated
          isPro
          isLocked
          countryCode
          url
          logo
          baseLogo
          bannerLogo
          winCount
          lossCount
          lastMatchDateTime
          countryName
        }
      }
    }
  }
`
