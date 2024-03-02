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
      //
      const getPredictions = async (match: any) => {
        const predictionHeroesAVG =
          await this.calculatePredictionByHeroesAVG(match)
        const predictionHeroesAVGSides =
          await this.calculatePredictionByHeroesAVGSides(match)
        const predictionHeroesSide =
          await this.calculatePredictionByHeroesRadiantOnly(match)
        const predictionHeroes = await this.calculatePredictionByHeroes(match)
        const predictionHeroesWith =
          await this.calculatePredictionByHeroesWith(match)
        const predictionHeroesWithSides =
          await this.calculatePredictionByHeroesWithSides(match)
        const predictionHeroesPositions =
          await this.calculatePredictionByHeroesAVGPositions(match)

        if (predictionHeroes) {
          return {
            matchId: match.matchId,
            start_date_time: match.createdDateTime,
            radiant_team_id: match.radiantTeamId,
            dire_team_id: match.direTeamId,
            predictionHeroesAVG,
            predictionHeroesAVGSides,
            predictionHeroes,
            predictionHeroesSide,
            predictionHeroesWith,
            predictionHeroesWithSides,
            predictionHeroesPositions,
          }
        } else {
          return null
        }
      }

      const predictions = await Promise.all(matches.map(getPredictions))

      // fltered Null predictions
      const nonNullPredictions = predictions.filter(
        (prediction) => prediction !== null,
      )

      await this.savePredictionsToDB(nonNullPredictions)

      return nonNullPredictions
      //
      //return matches[0]
      //return await this.calculatePredictionByHeroesWith(matches[0])
      //return await this.calculatePredictionByHeroesWithSides(matches[1])
      //return await this.getHeroesWithStatisticByMatch(matches[0])
      //return await this.calculatePredictionByHeroesRadiantOnly(matches[1])
      //return await this.calculatePredictionByHeroes(matches[1])
      //return await this.getHeroesWithStatisticByMatch(matches[2])
      //return await this.calculatePredictionByHeroesAVG(matches[0])
      //return await this.getHeroesAVGStatisticByMatch(matches[0])
      //return await this.calculatePredictionByHeroesAVGPositions(matches[0])
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
      }))
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
}
