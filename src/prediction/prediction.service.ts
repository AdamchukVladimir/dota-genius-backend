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
        const predictionHeroesSide =
          await this.calculatePredictionByHeroesRadiantOnly(match)
        const predictionHeroes = await this.calculatePredictionByHeroes(match)

        if (predictionHeroes) {
          return {
            matchId: match.matchId,
            start_date_time: match.createdDateTime,
            radiant_team_id: match.radiantTeamId,
            dire_team_id: match.direTeamId,
            predictionHeroes,
            predictionHeroesSide,
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
      //return await this.calculatePredictionByHeroesWith(matches[3])
      //return await this.getHeroesWithStatisticByMatch(matches[3])
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
        prediction_heroes: prediction.predictionHeroes,
        prediction_heroes_sides: prediction.predictionHeroesSide,
      }))
      const options = {
        ignoreDuplicates: true,
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
          const heroTotal = heroes.reduce((total, current) => {
            if (parseInt(current.radiantmatchescount) > 10) {
              return (
                total +
                (parseInt(current.radiantmatcheswin) /
                  parseInt(current.radiantmatchescount) +
                  parseInt(current.matcheswin) /
                    parseInt(current.matchescount)) /
                  2
              )
            }
            return (
              total +
              parseInt(current.matcheswin) / parseInt(current.matchescount)
            )
          }, 0)

          totalSum += heroTotal / heroes.length
          totalCount++
        }
      }

      const average = totalSum / totalCount

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
          const heroTotal = heroes.reduce((total, current) => {
            if (parseInt(current.radiantmatchescount) > 10) {
              return (
                total +
                parseInt(current.radiantmatcheswin) /
                  parseInt(current.radiantmatchescount)
              )
            }
            return (
              total +
              parseInt(current.matcheswin) / parseInt(current.matchescount)
            )
          }, 0)
          totalSum += heroTotal / heroes.length
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

  async calculatePredictionByHeroesWith(match: any): Promise<any> {
    try {
      const matchHeroesWithStatistic =
        await this.getHeroesWithStatisticByMatch(match)
      let totalSum = 0
      let totalCount = 0

      for (const heroId in matchHeroesWithStatistic[0]) {
        const heroes = matchHeroesWithStatistic[heroId]
        console.log('heroes: ' + JSON.stringify(heroes))
        if (heroes) {
          const heroTotal = heroes.reduce((total, current) => {
            console.log('current - ' + current.hero1 + ' ' + current.hero2)
            console.log(
              'avg - ' +
                parseInt(current.matcheswin) / parseInt(current.matchescount),
            )
            // if (parseInt(current.radiantmatchescount) > 10) {
            //   return (
            //     total +
            //     (parseInt(current.radiantmatcheswin) /
            //       parseInt(current.radiantmatchescount) +
            //       parseInt(current.matcheswin) /
            //         parseInt(current.matchescount)) /
            //       2
            //   )
            // }
            return (
              total +
              parseInt(current.matcheswin) / parseInt(current.matchescount)
            )
          }, 0)

          totalSum += heroTotal / heroes.length
          totalCount++
        }
      }

      const average = totalSum / totalCount

      return average
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          'prediction.service calculatePredictionByHeroes Error:',
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
