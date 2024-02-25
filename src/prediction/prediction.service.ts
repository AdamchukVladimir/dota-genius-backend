import { Injectable, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_LIVE_QUERY } from '../api/graphql/queries/live'
import { Heroes } from 'src/models/heroes.model'
import { Op } from 'sequelize'

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
      const predictions = await Promise.all(
        matches.map(async (match: any) => {
          const predictionHeroesSide =
            await this.calculatePredictionByHeroesRadiantOnly(match)
          const predictionHeroes = await this.calculatePredictionByHeroes(match)

          //more predictions will be here

          return predictionHeroes
            ? { matchid: match.matchId, predictionHeroes, predictionHeroesSide }
            : null
        }),
      )

      return predictions
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
        const heroTotal = heroes.reduce((total, current) => {
          if (parseInt(current.radiantmatchescount) > 10) {
            return (
              total +
              (parseInt(current.radiantmatcheswin) /
                parseInt(current.radiantmatchescount) +
                parseInt(current.matcheswin) / parseInt(current.matchescount)) /
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
}
