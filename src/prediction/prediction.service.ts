import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_LIVE_QUERY } from '../api/graphql/queries/live'
import { Heroes } from 'src/models/heroes.model'
import { Op } from 'sequelize'
import { Predictions } from 'src/models/predictions.model'
import { HeroesWith } from 'src/models/heroeswith.model'
import { HeroesAVG } from 'src/models/heroesavg.model'
import { TeamHeroes } from 'src/models/teamheroes.model'
import { TeamHeroesVersus } from 'src/models/teamheroesversus.model'
import { MATCH_DETAILS_QUERY } from 'src/api/graphql/queries/matchDetails'
import { Team } from 'src/models/teams.model'
import { TeamsVsTeams } from 'src/models/temsvsteams.model'
import { Players } from 'src/models/players.model'

@Injectable()
export class PredictionService {
  constructor(
    private readonly graphQLService: GraphQLService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async processPredictions(): Promise<any> {
    try {
      const allLiveMatches = await this.fetchAllLiveMatches() // Fetches data as a promise
      const matches = allLiveMatches.data.live.matches

      // const getPredictions = async (match: any) => {
      //   const predictionHeroesAVG =
      //     await this.calculatePredictionByHeroesAVG(match)
      //   const predictionHeroesAVGSides =
      //     await this.calculatePredictionByHeroesAVGSides(match)
      //   const predictionHeroesSide =
      //     await this.calculatePredictionByHeroesRadiantOnly(match)
      //   const predictionHeroes = await this.calculatePredictionByHeroes(match)
      //   const predictionHeroesWith =
      //     await this.calculatePredictionByHeroesWith(match)
      //   const predictionHeroesWithSides =
      //     await this.calculatePredictionByHeroesWithSides(match)
      //   const predictionHeroesPositions =
      //     await this.calculatePredictionByHeroesAVGPositions(match)
      //   const predictionTeamHeroes =
      //     await this.calculatePredictionByTeamHeroes(match)
      //   const predictionTeamHeroesVersus =
      //     await this.calculatePredictionByTeamHeroesVersus(match)
      //   const predictionTeamAVG =
      //     await this.calculatePredictionByTeamsAVG(match)
      //   const predictionTeamVsTeam =
      //     await this.calculatePredictionByTeamVsTeam(match)
      //   const predictionPlayers = await this.calculatePredictionByPlayers(match)
      //   const predictionPlayersPosition =
      //     await this.calculatePredictionByPlayersPosition(match)

      //   if (predictionHeroes) {
      //     return {
      //       matchId: match.matchId,
      //       start_date_time: match.createdDateTime,
      //       radiant_team_id: match.radiantTeamId,
      //       dire_team_id: match.direTeamId,
      //       predictionHeroesAVG,
      //       predictionHeroesAVGSides,
      //       predictionHeroes,
      //       predictionHeroesSide,
      //       predictionHeroesWith,
      //       predictionHeroesWithSides,
      //       predictionHeroesPositions,
      //       predictionTeamHeroes,
      //       predictionTeamHeroesVersus,
      //       predictionTeamAVG,
      //       predictionTeamVsTeam,
      //       predictionPlayers,
      //       predictionPlayersPosition,
      //     }
      //   } else {
      //     return null
      //   }
      // }

      // const predictions = await Promise.all(matches.map(getPredictions))

      // // fltered Null predictions
      // const nonNullPredictions = predictions.filter(
      //   (prediction) => prediction !== null,
      // )

      // await this.savePredictionsToDB(nonNullPredictions)

      // return nonNullPredictions

      //
      return matches[0]
      //return await this.calculatePredictionByHeroesWith(matches[0])
      //return await this.calculatePredictionByHeroesWithSides(matches[1])
      //return await this.getHeroesWithStatisticByMatch(matches[0])
      //return await this.calculatePredictionByHeroesRadiantOnly(matches[1])
      //return await this.calculatePredictionByHeroes(matches[1])
      //return await this.getHeroesWithStatisticByMatch(matches[2])
      //return await this.calculatePredictionByHeroesAVG(matches[0])
      //return await this.getHeroesAVGStatisticByMatch(matches[0])
      //return await this.calculatePredictionByHeroesAVGPositions(matches[0])
      return await this.calculatePredictionByTeamHeroes(matches[0])
      //return await this.getTeamHeroesStatisticByMatch(matches[2])
      //return await this.getTeamHeroesVersusStatisticByMatch(matches[1])
      //return await this.calculatePredictionByTeamHeroesVersus(matches[0])
      return await this.calculatePredictionByPlayersPosition(matches[0])
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service processPredictions Error :`,
        error,
      )
    }
  }

  async savePredictionsToDB(predictions: any): Promise<void> {
    try {
      const predictionToCreate = predictions.map((prediction) => ({
        match_id: prediction.matchId,
        start_date_time: prediction.start_date_time,
        radiant_team_id: prediction.radiant_team_id,
        dire_team_id: prediction.dire_team_id,
        prediction_heroes_avg: prediction.predictionHeroesAVG,
        prediction_heroes_avg_sides: prediction.predictionHeroesAVGSides,
        prediction_heroes: prediction.predictionHeroes,
        prediction_heroes_sides: prediction.predictionHeroesSide,
        prediction_heroes_with: prediction.predictionHeroesWith,
        prediction_heroes_with_sides: prediction.predictionHeroesWithSides,
        prediction_heroes_positions: prediction.predictionHeroesPositions,
        prediction_team_heroes: prediction.predictionTeamHeroes,
        prediction_team_heroes_versus: prediction.predictionTeamHeroesVersus,
        prediction_team_avg: prediction.predictionTeamAVG,
        prediction_team_vs_team: prediction.predictionTeamVsTeam,
        prediction_players_positions: prediction.predictionPlayersPosition,
        prediction_players: prediction.predictionPlayers,
      }))
      console.log('predictionToCreate - ' + JSON.stringify(predictionToCreate))
      const fieldsToUpdate = [
        'start_date_time',
        'radiant_team_id',
        'dire_team_id',
        'prediction_heroes_avg',
        'prediction_heroes_avg_sides',
        'prediction_heroes',
        'prediction_heroes_sides',
        'prediction_heroes_with',
        'prediction_heroes_with_sides',
        'prediction_heroes_positions',
        'prediction_team_heroes',
        'prediction_team_heroes_versus',
        'prediction_players_positions',
        'prediction_players',
      ]

      const options = {
        updateOnDuplicate: fieldsToUpdate,
      }
      await Predictions.bulkCreate(predictionToCreate, options)
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service savePredictionsToDB Error :`,
        error,
      )
    }
  }

  async testProcessPredictions(): Promise<any> {
    const match = await this.fetchMatchDetails(7606584250)
    return await this.getTeamHeroesStatisticByMatch(match)
    //return await this.getTeamHeroesVersusStatisticByMatch(matches[4])
    //return await this.calculatePredictionByTeamHeroesVersus(matches[2])
    return await this.getTeamHeroesVersusStatisticByMatch(match)
  }

  async fetchMatchDetails(matchId: number): Promise<any> {
    console.log('Fetching matches id: ' + matchId)
    try {
      const result = await this.graphQLService.apolloClient.query({
        query: MATCH_DETAILS_QUERY,
        variables: {
          matchId: Number(matchId),
        },
      })
      this.logger.info(
        new Date().toLocaleString() +
          ' matches.service fetchMatchDetails. result: ' +
          result,
      )
      return result.data.match
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() + ' match.service ERROR fetchMatchDetails:',
        error,
      )
    }
  }

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

  async calculatePredictionByHeroes(match: any): Promise<any> {
    try {
      const matchHeroesStatistic = await this.getHeroesStatisticByMatch(match)
      let totalSum = 0
      let totalCount = 0

      for (const heroId in matchHeroesStatistic) {
        const heroes = matchHeroesStatistic[heroId]

        if (heroes) {
          let heroesCount = 0
          const heroTotal = heroes.reduce((total, current) => {
            if (
              current &&
              current.radiantmatchescount !== null &&
              current.matchescount !== null
            ) {
              if (parseInt(current.radiantmatchescount) > 10) {
                heroesCount++
                return (
                  total +
                  (parseInt(current.radiantmatcheswin) /
                    parseInt(current.radiantmatchescount) +
                    parseInt(current.matcheswin) /
                      parseInt(current.matchescount)) /
                    2
                )
              } else if (parseInt(current.matchescount) > 10) {
                heroesCount++
                return (
                  total +
                  parseInt(current.matcheswin) / parseInt(current.matchescount)
                )
              } else return total
            } else {
              return total
            }
          }, 0)

          totalSum += heroTotal / heroesCount
          totalCount++
        }
      }

      const average = totalSum / totalCount
      console.log('totalCount ' + totalCount)
      return average
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroes Error:',
        error,
      )
    }
  }

  async calculatePredictionByHeroesRadiantOnly(match: any): Promise<any> {
    try {
      const matchHeroesStatistic = await this.getHeroesStatisticByMatch(match)

      let totalSum = 0
      let totalCount = 0

      for (const heroId in matchHeroesStatistic) {
        const heroes = matchHeroesStatistic[heroId]

        if (heroes) {
          let heroesCount = 0
          const heroTotal = heroes.reduce((total, current) => {
            if (
              current &&
              current.radiantmatchescount !== null &&
              current.matchescount !== null
            ) {
              if (parseInt(current.radiantmatchescount) > 10) {
                heroesCount++
                return (
                  total +
                  parseInt(current.radiantmatcheswin) /
                    parseInt(current.radiantmatchescount)
                )
              } else if (parseInt(current.matchescount) > 10) {
                heroesCount++
                return (
                  total +
                  parseInt(current.matcheswin) / parseInt(current.matchescount)
                )
              } else return total
            } else {
              return total
            }
          }, 0)

          totalSum += heroTotal / heroesCount
          totalCount++
        }
      }

      const average = totalSum / totalCount
      return average
      //return results

      //return matchHeroesStatistic
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service calculatePredictionByHeroes Error :`,
        error,
      )
    }
  }

  async getHeroesStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.heroId)

      const direHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.heroId)

      const heroesStatisticByRadiantHero: { [key: number]: any[] } = {}

      for (const radiantId of radiantHeroesIds) {
        const promises: Promise<any>[] = []
        for (const direId of direHeroesIds) {
          promises.push(
            this.getStatisticByRadiantAndDireHeroes(radiantId, direId),
          )
        }
        heroesStatisticByRadiantHero[radiantId] = await Promise.all(promises)
      }

      return heroesStatisticByRadiantHero
      //return [...radiantHeroesIds, ...direHeroesIds]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service calculatePredictionByHeroes Error :`,
        error,
      )
    }
  }

  async getStatisticByRadiantAndDireHeroes(
    radiantHeroId: number,
    direHeroId: number,
  ): Promise<any> {
    try {
      const heroStatisticRecord = await Heroes.findOne({
        where: {
          [Op.and]: [
            {
              hero1: {
                [Op.eq]: radiantHeroId,
              },
            },
            {
              hero2: {
                [Op.eq]: direHeroId,
              },
            },
          ],
        },
      })
      return heroStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByRadiantAndDireHeroes Error :`,
        error,
      )
    }
  }

  getPositionByHero(players: any[], heroId: number): string {
    console.log(
      'getPositionByHero ' + JSON.stringify(players[0].heroId) + ' ' + heroId,
    )
    const player = players.find((player) => player.heroId == heroId)
    console.log('player ' + player.position)
    if (!player) return ''
    return player.position
  }

  async calculatePredictionByHeroesAVGPositions(match: any): Promise<any> {
    try {
      const matchHeroesAVGStatistic =
        await this.getHeroesAVGStatisticByMatch(match)
      if (matchHeroesAVGStatistic.length !== 2) return [0, 0]

      const sumBySide = (sideData, sideSum) => {
        let totalSum = 0
        let totalCount = 0

        for (let i = 0; i < sideData.length; i++) {
          const current = sideData[i]
          const position = this.getPositionByHero(
            match.players,
            current.hero_id,
          )
          const positionData =
            current[`position_${position.slice(-1)}_matchescount`]
          const winData = current[`position_${position.slice(-1)}_matcheswin`]

          if (parseFloat(positionData) > 10) {
            totalCount++
            totalSum += parseFloat(winData) / parseFloat(positionData)
            console.log(
              'current id ' +
                current.hero_id +
                ' position ' +
                position +
                ' positionData ' +
                positionData +
                ' win ' +
                winData +
                ' winrate ' +
                parseFloat(winData) / parseFloat(positionData),
            )
          }
        }
        return sideSum + (totalCount ? totalSum / totalCount : 0)
      }

      let radiantTotalSum = sumBySide(matchHeroesAVGStatistic[0], 0)
      let direTotalSum = sumBySide(matchHeroesAVGStatistic[1], 0)

      const advantageHeroesAVG = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesAVG
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroesAVGSides Error:',
        error,
      )
    }
  }

  async calculatePredictionByHeroesAVGSides(match: any): Promise<any> {
    try {
      const matchHeroesAVGStatistic =
        await this.getHeroesAVGStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageHeroesAVG = 0

      //radiant

      const radiantStatistic = matchHeroesAVGStatistic[0]
      console.log('radiantStatistic - ' + JSON.stringify(radiantStatistic))
      if (radiantStatistic) {
        const radiantTotal = radiantStatistic.reduce((total, current) => {
          if (parseInt(current.radiant_matches_count) > 10) {
            radiantTotalCount++
            console.log(
              'radiant - ' +
                current.hero_id +
                ' ' +
                parseInt(current.radiant_matches_win) /
                  parseInt(current.radiant_matches_count),
            )
            return (
              total +
              parseInt(current.radiant_matches_win) /
                parseInt(current.radiant_matches_count)
            )
          } else if (parseInt(current.matches_count) > 10) {
            radiantTotalCount++
            return (
              total +
              parseInt(current.matches_win) / parseInt(current.matches_count)
            )
          } else return total
        }, 0)
        radiantTotalSum += radiantTotal / radiantTotalCount
      }

      //dire
      const direStatistic = matchHeroesAVGStatistic[1]
      if (direStatistic) {
        const direTotal = direStatistic.reduce((total, current) => {
          if (parseInt(current.dire_matches_count) > 10) {
            direTotalCount++
            console.log(
              'dire - ' +
                current.hero_id +
                ' ' +
                parseInt(current.dire_matches_win) /
                  parseInt(current.dire_matches_count),
            )
            return (
              total +
              parseInt(current.dire_matches_win) /
                parseInt(current.dire_matches_count)
            )
          } else if (parseInt(current.matches_count) > 10) {
            direTotalCount++
            return (
              total +
              parseInt(current.matches_win) / parseInt(current.matches_count)
            )
          } else return total
        }, 0)
        direTotalSum += direTotal / direTotalCount
      }

      advantageHeroesAVG = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesAVG
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroesAVGSides Error:',
        error,
      )
    }
  }

  async calculatePredictionByHeroesAVG(match: any): Promise<any> {
    try {
      const matchHeroesAVGStatistic =
        await this.getHeroesAVGStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageHeroesAVG = 0

      //radiant

      const radiantStatistic = matchHeroesAVGStatistic[0]
      console.log('radiantStatistic - ' + JSON.stringify(radiantStatistic))
      if (radiantStatistic) {
        const radiantTotal = radiantStatistic.reduce((total, current) => {
          if (parseInt(current.radiant_matches_count) > 10) {
            radiantTotalCount++
            console.log(
              'radiant - ' +
                current.hero_id +
                ' ' +
                parseInt(current.radiant_matches_win) /
                  parseInt(current.radiant_matches_count),
            )
            return (
              total +
              (parseInt(current.radiant_matches_win) /
                parseInt(current.radiant_matches_count) +
                parseInt(current.matches_win) /
                  parseInt(current.matches_count)) /
                2
            )
          } else if (parseInt(current.matches_count) > 10) {
            radiantTotalCount++
            return (
              total +
              parseInt(current.matches_win) / parseInt(current.matches_count)
            )
          } else return total
        }, 0)
        radiantTotalSum += radiantTotal / radiantTotalCount
      }

      //dire
      const direStatistic = matchHeroesAVGStatistic[1]
      if (direStatistic) {
        const direTotal = direStatistic.reduce((total, current) => {
          if (parseInt(current.dire_matches_count) > 10) {
            direTotalCount++
            console.log(
              'dire - ' +
                current.hero_id +
                ' ' +
                parseInt(current.dire_matches_win) /
                  parseInt(current.dire_matches_count),
            )
            return (
              total +
              (parseInt(current.dire_matches_win) /
                parseInt(current.dire_matches_count) +
                parseInt(current.matches_win) /
                  parseInt(current.matches_count)) /
                2
            )
          } else if (parseInt(current.matches_count) > 10) {
            direTotalCount++
            return (
              total +
              parseInt(current.matches_win) / parseInt(current.matches_count)
            )
          } else return total
        }, 0)
        direTotalSum += direTotal / direTotalCount
      }

      advantageHeroesAVG = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesAVG
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroesAVGSides Error:',
        error,
      )
    }
  }
  async getHeroesAVGStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.heroId)

      const direHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.heroId)

      let heroesAVGStatisticByRadiantHero: any[] = []
      for (const radiantId of radiantHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(this.getStatisticByHeroesAVG(radiantId))
        const results = await Promise.all(promises)
        heroesAVGStatisticByRadiantHero.push(...results)
      }

      let heroesAVGStatisticByDireHero: any[] = []
      for (const direId of direHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(this.getStatisticByHeroesAVG(direId))
        const results = await Promise.all(promises)
        heroesAVGStatisticByDireHero.push(...results)
      }

      return [heroesAVGStatisticByRadiantHero, heroesAVGStatisticByDireHero]
      //return [...radiantHeroesIds, ...direHeroesIds]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service calculatePredictionByHeroes Error :`,
        error,
      )
    }
  }

  async getStatisticByHeroesAVG(heroId: number): Promise<any> {
    try {
      const heroAVGStatisticRecord = await HeroesAVG.findOne({
        where: {
          hero_id: {
            [Op.eq]: heroId,
          },
        },
      })
      return heroAVGStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByHeroesAVG Error :`,
        error,
      )
    }
  }

  async calculatePredictionByHeroesWith(match: any): Promise<any> {
    try {
      const matchHeroesWithStatistic =
        await this.getHeroesWithStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageHeroesWith = 0

      //radiant

      const radiantStatistic = matchHeroesWithStatistic[0]
      if (radiantStatistic) {
        const radiantTotal = radiantStatistic.reduce((total, current) => {
          if (parseInt(current.radiantmatchescount) > 10) {
            radiantTotalCount++
            return (
              total +
              (parseInt(current.radiantmatcheswin) /
                parseInt(current.radiantmatchescount) +
                parseInt(current.matcheswin) / parseInt(current.matchescount)) /
                2
            )
          } else if (parseInt(current.matchescount) > 10) {
            radiantTotalCount++
            return (
              total +
              parseInt(current.matcheswin) / parseInt(current.matchescount)
            )
          } else return total
        }, 0)
        radiantTotalSum += radiantTotal / radiantTotalCount
      }

      //dire
      const direStatistic = matchHeroesWithStatistic[1]
      if (direStatistic) {
        const direTotal = direStatistic.reduce((total, current) => {
          if (parseInt(current.dirematchescount) > 10) {
            direTotalCount++
            return (
              total +
              (parseInt(current.dirematcheswin) /
                parseInt(current.dirematchescount) +
                parseInt(current.matcheswin) / parseInt(current.matchescount)) /
                2
            )
          } else if (parseInt(current.matchescount) > 10) {
            direTotalCount++
            return (
              total +
              parseInt(current.matcheswin) / parseInt(current.matchescount)
            )
          } else return total
        }, 0)
        direTotalSum += direTotal / direTotalCount
      }

      advantageHeroesWith = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesWith
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroesWith Error:',
        error,
      )
    }
  }

  async calculatePredictionByHeroesWithSides(match: any): Promise<any> {
    try {
      const matchHeroesWithStatistic =
        await this.getHeroesWithStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageHeroesWith = 0

      //radiant

      const radiantStatistic = matchHeroesWithStatistic[0]
      if (radiantStatistic) {
        const radiantTotal = radiantStatistic.reduce((total, current) => {
          if (
            current &&
            current.radiantmatchescount !== null &&
            current.matchescount !== null
          ) {
            if (parseInt(current.radiantmatchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                parseInt(current.radiantmatcheswin) /
                  parseInt(current.radiantmatchescount)
              )
            } else if (parseInt(current.matchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          } else {
            return total
          }
        }, 0)
        radiantTotalSum += radiantTotal / radiantTotalCount
      }

      //dire
      const direStatistic = matchHeroesWithStatistic[1]
      if (direStatistic) {
        const direTotal = direStatistic.reduce((total, current) => {
          if (
            current &&
            current.radiantmatchescount !== null &&
            current.matchescount !== null
          ) {
            if (parseInt(current.dirematchescount) > 10) {
              direTotalCount++
              return (
                total +
                parseInt(current.dirematcheswin) /
                  parseInt(current.dirematchescount)
              )
            } else if (parseInt(current.matchescount) > 10) {
              direTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          } else {
            return total
          }
        }, 0)
        direTotalSum += direTotal / direTotalCount
      }

      advantageHeroesWith = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesWith
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroesWith Error:',
        error,
      )
    }
  }

  async getHeroesWithStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.heroId)

      const direHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.heroId)

      const combinationsRadiant = this.getAllCombinations(radiantHeroesIds, 2)
      const combinationsDire = this.getAllCombinations(direHeroesIds, 2)

      const statisticsRadiant = await Promise.all(
        combinationsRadiant.map(([hero1, hero2]) =>
          this.getStatisticByHeroesWith(hero1, hero2),
        ),
      )

      const statisticsDire = await Promise.all(
        combinationsDire.map(([hero1, hero2]) =>
          this.getStatisticByHeroesWith(hero1, hero2),
        ),
      )
      return [statisticsRadiant, statisticsDire]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getHeroesWithStatisticByMatch Error :`,
        error,
      )
    }
  }
  //Helper for HeroesWithStatistic
  getAllCombinations(array: any[], size: number) {
    const combinations = []

    function getCombinations(start: number, result: any[]) {
      if (result.length === size) {
        combinations.push(result.slice())
        return
      }

      for (let i = start; i < array.length; i++) {
        result.push(array[i])
        getCombinations(i + 1, result)
        result.pop()
      }
    }

    getCombinations(0, [])
    return combinations
  }

  async getStatisticByHeroesWith(hero1: number, hero2: number): Promise<any> {
    try {
      const heroStatisticRecord = await HeroesWith.findOne({
        where: {
          [Op.and]: [
            {
              hero1: {
                [Op.eq]: hero1,
              },
            },
            {
              hero2: {
                [Op.eq]: hero2,
              },
            },
          ],
        },
      })
      return heroStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByHeroesWith Error :`,
        error,
      )
    }
  }

  async calculatePredictionByTeamHeroes(match: any): Promise<any> {
    try {
      const matchTeamHeroesStatistic =
        await this.getTeamHeroesStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageTeamHeroes = 0.5

      //radiant

      const radiantStatistic = matchTeamHeroesStatistic[0]
      console.log('radiantStatistic ' + JSON.stringify(radiantStatistic))
      if (radiantStatistic) {
        if (radiantStatistic[0]) {
          const radiantTotal = radiantStatistic.reduce((total, current) => {
            if (parseInt(current.radiantmatchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                (parseInt(current.radiantmatcheswin) /
                  parseInt(current.radiantmatchescount) +
                  parseInt(current.matcheswin) /
                    parseInt(current.matchescount)) /
                  2
              )
            } else if (parseInt(current.matchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)
          radiantTotalSum += radiantTotal / radiantTotalCount
        }
      }

      //dire
      const direStatistic = matchTeamHeroesStatistic[1]
      if (direStatistic) {
        if (direStatistic[0]) {
          const direTotal = direStatistic.reduce((total, current) => {
            if (parseInt(current.dirematchescount) > 10) {
              direTotalCount++
              return (
                total +
                (parseInt(current.dirematcheswin) /
                  parseInt(current.dirematchescount) +
                  parseInt(current.matcheswin) /
                    parseInt(current.matchescount)) /
                  2
              )
            } else if (parseInt(current.matchescount) > 10) {
              direTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)
          direTotalSum += direTotal / direTotalCount
        }
      }
      console.log(
        'radiantTotalSum - ' +
          radiantTotalSum +
          ' radiantTotalCount ' +
          radiantTotalCount,
      )
      console.log(
        'direTotalSum - ' + direTotalSum + ' direTotalCount ' + direTotalCount,
      )

      if (radiantTotalSum && direTotalSum) {
        advantageTeamHeroes = 0.5 + radiantTotalSum - direTotalSum
      } else if (radiantTotalSum > 0.5) {
        return radiantTotalSum
      } else if (direTotalSum > 0.5) {
        return direTotalSum
      }

      return advantageTeamHeroes
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByTeamHeroes Error:',
        error,
      )
    }
  }

  async getTeamHeroesStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.heroId)

      const direHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.heroId)

      let teamHeroesStatisticByRadiantHero: any[] = []
      for (const radiantId of radiantHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(
          this.getStatisticByTeamHeroes(match.radiantTeamId, radiantId),
        )
        const results = await Promise.all(promises)
        teamHeroesStatisticByRadiantHero.push(...results)
      }

      let teamHeroesStatisticByDireHero: any[] = []
      for (const direId of direHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(this.getStatisticByTeamHeroes(match.direTeamId, direId))
        const results = await Promise.all(promises)
        teamHeroesStatisticByDireHero.push(...results)
      }

      return [teamHeroesStatisticByRadiantHero, teamHeroesStatisticByDireHero]
      //return [...radiantHeroesIds, ...direHeroesIds]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getTeamHeroesStatisticByMatch Error :`,
        error,
      )
    }
  }

  async calculatePredictionByTeamHeroesVersus(match: any): Promise<any> {
    try {
      const matchTeamHeroesStatistic =
        await this.getTeamHeroesVersusStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantageTeamHeroesVersus = 0

      //radiant

      const radiantStatistic = matchTeamHeroesStatistic[0]
      if (radiantStatistic) {
        if (radiantStatistic[0]) {
          const radiantTotal = radiantStatistic.reduce((total, current) => {
            if (parseInt(current.radiantmatchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                (parseInt(current.radiantmatcheswin) /
                  parseInt(current.radiantmatchescount) +
                  parseInt(current.matcheswin) /
                    parseInt(current.matchescount)) /
                  2
              )
            } else if (parseInt(current.matchescount) > 10) {
              radiantTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)

          if (radiantTotalCount > 0) {
            radiantTotalSum += radiantTotal / radiantTotalCount
          }
        }
      }

      //dire
      const direStatistic = matchTeamHeroesStatistic[1]
      if (direStatistic) {
        if (direStatistic[0]) {
          const direTotal = direStatistic.reduce((total, current) => {
            if (parseInt(current.dirematchescount) > 10) {
              direTotalCount++
              return (
                total +
                (parseInt(current.dirematcheswin) /
                  parseInt(current.dirematchescount) +
                  parseInt(current.matcheswin) /
                    parseInt(current.matchescount)) /
                  2
              )
            } else if (parseInt(current.matchescount) > 10) {
              direTotalCount++
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)
          if (direTotalCount > 0) {
            direTotalSum += direTotal / direTotalCount
          }
        }
      }
      advantageTeamHeroesVersus = 0.5 + radiantTotalSum - direTotalSum
      return advantageTeamHeroesVersus
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByTeamHeroesVersus Error:',
        error,
      )
    }
  }

  async getStatisticByTeamHeroes(teamid: number, heroid: number): Promise<any> {
    try {
      const heroStatisticRecord = await TeamHeroes.findOne({
        where: {
          [Op.and]: [
            {
              teamid: {
                [Op.eq]: teamid,
              },
            },
            {
              heroid: {
                [Op.eq]: heroid,
              },
            },
          ],
        },
      })
      return heroStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByTeamHeroes Error :`,
        error,
      )
    }
  }

  async getTeamHeroesVersusStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.heroId)

      const direHeroesIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.heroId)

      let teamHeroesStatisticByRadiantHero: any[] = []
      for (const direId of direHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(
          this.getStatisticByTeamHeroesVersus(match.radiantTeamId, direId),
        )
        const results = await Promise.all(promises)
        teamHeroesStatisticByRadiantHero.push(...results)
      }

      let teamHeroesStatisticByDireHero: any[] = []
      for (const radiantId of radiantHeroesIds) {
        const promises: Promise<any>[] = []
        promises.push(
          this.getStatisticByTeamHeroesVersus(match.direTeamId, radiantId),
        )
        const results = await Promise.all(promises)
        teamHeroesStatisticByDireHero.push(...results)
      }

      return [teamHeroesStatisticByRadiantHero, teamHeroesStatisticByDireHero]
      //return [...radiantHeroesIds, ...direHeroesIds]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getTeamHeroesVersusStatisticByMatch Error :`,
        error,
      )
    }
  }

  async getStatisticByTeamHeroesVersus(
    teamid: number,
    heroid: number,
  ): Promise<any> {
    try {
      const heroStatisticRecord = await TeamHeroesVersus.findOne({
        where: {
          [Op.and]: [
            {
              teamid: {
                [Op.eq]: teamid,
              },
            },
            {
              heroid: {
                [Op.eq]: heroid,
              },
            },
          ],
        },
      })
      return heroStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByTeamHeroesVersus Error :`,
        error,
      )
    }
  }

  async calculatePredictionByTeamsAVG(match: any): Promise<any> {
    try {
      const radiantStatistic = await this.getStatisticByTeamAVG(
        match.radiantTeamId,
      )
      const direStatistic = await this.getStatisticByTeamAVG(match.direTeamId)
      let radiantTotalSum = 0
      let direTotalSum = 0
      let advantageHeroesAVG = 0

      //radiant

      if (radiantStatistic) {
        if (parseInt(radiantStatistic.radiantmatchescount) > 10) {
          radiantTotalSum =
            (parseInt(radiantStatistic.radiantmatcheswin) /
              parseInt(radiantStatistic.radiantmatchescount) +
              parseInt(radiantStatistic.matcheswin) /
                parseInt(radiantStatistic.matchescount)) /
            2
        } else if (parseInt(radiantStatistic.matchescount) > 10) {
          radiantTotalSum =
            parseInt(radiantStatistic.matcheswin) /
            parseInt(radiantStatistic.matchescount)
        }
      }

      //dire
      if (direStatistic) {
        if (parseInt(direStatistic.dirematchescount) > 10) {
          direTotalSum =
            (parseInt(direStatistic.dirematcheswin) /
              parseInt(direStatistic.dirematchescount) +
              parseInt(direStatistic.matcheswin) /
                parseInt(direStatistic.matchescount)) /
            2
        } else if (parseInt(direStatistic.matchescount) > 10) {
          direTotalSum =
            parseInt(direStatistic.matcheswin) /
            parseInt(direStatistic.matchescount)
        }
      }

      advantageHeroesAVG = 0.5 + radiantTotalSum - direTotalSum
      return advantageHeroesAVG
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByTeamsAVG Error:',
        error,
      )
    }
  }

  async getStatisticByTeamAVG(teamid: number): Promise<any> {
    try {
      const teamStatisticRecord = await Team.findOne({
        where: {
          teamid: {
            [Op.eq]: teamid,
          },
        },
      })
      return teamStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByTeamAVG Error :`,
        error,
      )
    }
  }

  async calculatePredictionByTeamVsTeam(match: any): Promise<any> {
    try {
      const teamVsTeamStatistic = await this.getStatisticByTeamVSTeam(
        match.radiantTeamId,
        match.direTeamId,
      )
      let TotalSum = 0.5

      if (teamVsTeamStatistic) {
        if (parseInt(teamVsTeamStatistic.radiantmatchescount) > 10) {
          TotalSum =
            (parseInt(teamVsTeamStatistic.radiantmatcheswin) /
              parseInt(teamVsTeamStatistic.radiantmatchescount) +
              parseInt(teamVsTeamStatistic.matcheswin) /
                parseInt(teamVsTeamStatistic.matchescount)) /
            2
        } else if (parseInt(teamVsTeamStatistic.matchescount) > 10) {
          TotalSum =
            parseInt(teamVsTeamStatistic.matcheswin) /
            parseInt(teamVsTeamStatistic.matchescount)
        }
      }

      return TotalSum
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByTeamVsTeam Error:',
        error,
      )
    }
  }

  async getStatisticByTeamVSTeam(
    team1id: number,
    team2id: number,
  ): Promise<any> {
    try {
      const teamVsTeamStatisticRecord = await TeamsVsTeams.findOne({
        where: {
          [Op.and]: [
            {
              team1id: {
                [Op.eq]: team1id,
              },
            },
            {
              team2id: {
                [Op.eq]: team2id,
              },
            },
          ],
        },
      })
      return teamVsTeamStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByTeamVSTeam Error :`,
        error,
      )
    }
  }

  async calculatePredictionByPlayers(match: any): Promise<any> {
    try {
      const matchPlayersStatistic = await this.getPlayersStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantagePlayers = 0

      //radiant

      const radiantStatistic = matchPlayersStatistic[0]
      console.log('radiantStatistic - ' + radiantStatistic)
      if (radiantStatistic) {
        if (radiantStatistic[0]) {
          const radiantTotal = radiantStatistic.reduce((total, current) => {
            if (parseInt(current.radiant_matchescount) > 10) {
              radiantTotalCount++
              console.log(
                'current rad id ' +
                  current.steamaccountid +
                  ' ' +
                  parseInt(current.matcheswin) +
                  ' ' +
                  parseInt(current.matchescount) +
                  ' = ' +
                  parseInt(current.matcheswin) / parseInt(current.matchescount),
              )
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
                // (parseInt(current.radiant_matcheswin) /
                //   parseInt(current.radiant_matchescount) +
                //   parseInt(current.matcheswin) /
                //     parseInt(current.matchescount)) /
                //   2
              )
            } else if (parseInt(current.matchescount) > 10) {
              radiantTotalCount++
              console.log(
                'current rad id ' +
                  current.steamaccountid +
                  ' ' +
                  parseInt(current.matcheswin) +
                  ' ' +
                  parseInt(current.matchescount) +
                  ' = ' +
                  parseInt(current.matcheswin) / parseInt(current.matchescount),
              )
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)

          if (radiantTotalCount > 0) {
            radiantTotalSum += radiantTotal / radiantTotalCount
          }
        }
      }

      //dire
      const direStatistic = matchPlayersStatistic[1]
      if (direStatistic) {
        if (direStatistic[0]) {
          const direTotal = direStatistic.reduce((total, current) => {
            if (parseInt(current.dire_matchescount) > 10) {
              direTotalCount++
              console.log(
                'current dir id ' +
                  current.steamaccountid +
                  ' ' +
                  parseInt(current.matcheswin) +
                  ' ' +
                  parseInt(current.matchescount) +
                  ' = ' +
                  parseInt(current.matcheswin) / parseInt(current.matchescount),
              )
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
                // (parseInt(current.dire_matcheswin) /
                //   parseInt(current.dire_matchescount) +
                //   parseInt(current.matcheswin) /
                //     parseInt(current.matchescount)) /
                //   2
              )
            } else if (parseInt(current.matchescount) > 10) {
              direTotalCount++
              console.log(
                'current dir id ' +
                  current.steamaccountid +
                  ' ' +
                  parseInt(current.matcheswin) +
                  ' ' +
                  parseInt(current.matchescount) +
                  ' = ' +
                  parseInt(current.matcheswin) / parseInt(current.matchescount),
              )
              return (
                total +
                parseInt(current.matcheswin) / parseInt(current.matchescount)
              )
            } else return total
          }, 0)
          if (direTotalCount > 0) {
            direTotalSum += direTotal / direTotalCount
          }
        }
      }
      console.log(
        'radiantTotalSum ' + radiantTotalSum + ' direTotalSum ' + direTotalSum,
      )
      console.log(
        'radiantTotalCount ' +
          radiantTotalCount +
          ' direTotalCount ' +
          direTotalCount,
      )
      advantagePlayers = 0.5 + radiantTotalSum - direTotalSum
      return advantagePlayers
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByPlayers Error:',
        error,
      )
    }
  }

  async calculatePredictionByPlayersPosition(match: any): Promise<any> {
    try {
      const matchPlayersStatistic = await this.getPlayersStatisticByMatch(match)
      let radiantTotalSum = 0
      let radiantTotalCount = 0
      let direTotalSum = 0
      let direTotalCount = 0
      let advantagePlayersPosition = 0

      //radiant
      function getWinrateByPos(playerPosition: string, player: any) {
        if (playerPosition && player) {
          if (
            playerPosition == 'POSITION_1' &&
            player.position_1_matchescount > 10
          )
            return player.position_1_matcheswin / player.position_1_matchescount
          else if (
            playerPosition == 'POSITION_2' &&
            player.position_2_matchescount > 10
          )
            return player.position_2_matcheswin / player.position_2_matchescount
          else if (
            playerPosition == 'POSITION_3' &&
            player.position_3_matchescount > 10
          )
            return player.position_3_matcheswin / player.position_3_matchescount
          else if (
            playerPosition == 'POSITION_4' &&
            player.position_4_matchescount > 10
          )
            return player.position_4_matcheswin / player.position_4_matchescount
          else if (
            playerPosition == 'POSITION_5' &&
            player.position_5_matchescount > 10
          )
            return player.position_5_matcheswin / player.position_5_matchescount
          else return
        }
        return
      }

      const radiantStatistic = matchPlayersStatistic[0]
      console.log('radiantStatistic - ' + radiantStatistic)
      if (radiantStatistic) {
        if (radiantStatistic[0]) {
          let radiantTotal = 0
          let currRad = null
          for (let i = 0; i < radiantStatistic.length; i++) {
            console.log(
              'match.players[i].position ' + match.players[i].position,
            )
            currRad = getWinrateByPos(
              match.players[i].position,
              radiantStatistic[i],
            )
            if (currRad) {
              console.log(
                'rad id- ' +
                  match.players[i].steamAccountId +
                  ': ' +
                  match.players[i].position,
              )
              console.log('rad statist ' + radiantStatistic[i])
              console.log('rad curr ' + currRad)
              radiantTotal += currRad
              radiantTotalCount++
            }
          }

          if (radiantTotalCount > 0) {
            radiantTotalSum += radiantTotal / radiantTotalCount
          }
        }
      }

      //dire

      const direStatistic = matchPlayersStatistic[1]
      console.log('direStatistic - ' + direStatistic)
      if (direStatistic) {
        if (direStatistic[0]) {
          let direTotal = 0
          let currDir = null
          for (let i = 0; i < direStatistic.length; i++) {
            currDir = getWinrateByPos(
              match.players[i + 5].position,
              direStatistic[i],
            )
            if (currDir) {
              console.log(
                'dir id- ' +
                  match.players[i + 5].steamAccountId +
                  ': ' +
                  match.players[i + 5].position,
              )
              console.log('dir statist ' + direStatistic[i])
              console.log('dir curr ' + currDir)
              direTotal += currDir
              direTotalCount++
            }
          }

          if (direTotalCount > 0) {
            direTotalSum += direTotal / direTotalCount
          }
        }
      }
      console.log(
        'radiantTotalSum ' + radiantTotalSum + ' direTotalSum ' + direTotalSum,
      )
      console.log(
        'direTotalCount ' +
          direTotalCount +
          ' radiantTotalCount ' +
          radiantTotalCount,
      )
      advantagePlayersPosition = 0.5 + radiantTotalSum - direTotalSum
      return advantagePlayersPosition
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByPlayersPosition Error:',
        error,
      )
    }
  }

  async getPlayersStatisticByMatch(match: any): Promise<any> {
    try {
      const radiantPlayersIds: number[] = match.players
        .filter((player: any) => player.isRadiant === true)
        .map((player: any) => player.steamAccountId)

      const direPlayersIds: number[] = match.players
        .filter((player: any) => player.isRadiant === false)
        .map((player: any) => player.steamAccountId)

      let statisticByRadiantPlayers: any[] = []
      for (const radiantPlayerId of radiantPlayersIds) {
        const promises: Promise<any>[] = []
        console.log(
          'getPlayersStatisticByMatch radiantPlayerId ' + radiantPlayerId,
        )
        promises.push(this.getStatisticByPlayer(radiantPlayerId))
        const results = await Promise.all(promises)
        statisticByRadiantPlayers.push(...results)
      }

      let statisticByDirePlayers: any[] = []
      for (const direPlayerId of direPlayersIds) {
        const promises: Promise<any>[] = []
        console.log('getPlayersStatisticByMatch direPlayerId ' + direPlayerId)
        promises.push(this.getStatisticByPlayer(direPlayerId))
        const results = await Promise.all(promises)
        statisticByDirePlayers.push(...results)
      }

      return [statisticByRadiantPlayers, statisticByDirePlayers]
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getPlayersStatisticByMatch Error :`,
        error,
      )
    }
  }

  async getStatisticByPlayer(playerId: number): Promise<any> {
    try {
      const playerStatisticRecord = await Players.findOne({
        where: {
          steamaccountid: {
            [Op.eq]: playerId.toString(),
          },
        },
      })
      return playerStatisticRecord
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` prediction.service getStatisticByPlayer Error :`,
        error,
      )
    }
  }
}
