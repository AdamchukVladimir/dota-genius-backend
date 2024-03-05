import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { GraphQLService } from '../api/graphql/graphql.service'
import { FETCH_MATCHES_BY_LEAGUE_QUERY } from '../api/graphql/queries/matchesByLeague'
import { LeaguesService } from '../leagues/leagues.service'
import { QueueService } from '../queues/queue.service'
import { Match } from '../models/match.model'
import { MatchesPlayers } from '../models/matchesplayers.model'
import { MATCH_DETAILS_QUERY } from '../api/graphql/queries/matchDetails'
import { Op } from 'sequelize'

@Injectable()
export class MatchesService {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly graphQLService: GraphQLService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  //@Cron(CronExpression.EVERY_5_MINUTES)
  @Cron(CronExpression.EVERY_DAY_AT_1AM) //Temporary off Cron
  async processMatchesByLeagues(): Promise<void> {
    try {
      const leagues = await this.leaguesService.getRecentLeaguesFromDB()

      for (const league of leagues) {
        await this.queueService.addMatchByLeagueTaskToQueue(league.league_id)
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' match.service Error processMatchesByLeagues:',
        error,
      )
    }
  }
  //@Cron(CronExpression.EVERY_DAY_AT_4AM)
  async processReloadMatchesDetails(): Promise<void> {
    try {
      const matchesEmpty = await this.getMatchesFromDB()

      for (const matchEmpty of matchesEmpty) {
        await this.queueService.addReloadMatchDetailsTaskToQueue(
          matchEmpty.match_id,
        )
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' match.service Error processReloadMatchesDetails:',
        error,
      )
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async deleteOldMatchesFromDB(): Promise<void> {
    try {
      let dateShift =
        60 * 60 * 24 * 30 * 1000 * Number(process.env.DATA_DURATION_MONTHS) ||
        60 * 60 * 24 * 30 * 2 * 1000

      let MonthsAgo = Math.floor((new Date().getTime() - dateShift) / 1000)
      // DElETE where endDateTime before MonthsAgo
      await Match.destroy({
        where: {
          startdatetime: {
            [Op.lt]: MonthsAgo,
          },
        },
      })
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' match.service ERROR deleteOldMatchesFromDB:',
        error,
      )
    }
  }

  async fetchMatchesByLeague(leagueId: number): Promise<any[]> {
    // async fetchMatchesByLeague(): Promise<any[]> {
    //   const leagueId = 15960
    try {
      let allMatches: any[] = []
      let matches
      let skipCounter = 0
      do {
        const result = await this.graphQLService.apolloClient.query({
          query: FETCH_MATCHES_BY_LEAGUE_QUERY,
          variables: {
            leagueId,
            skip: skipCounter,
            take: 100,
          },
          fetchPolicy: 'no-cache', // fix cache overload
        })
        matches = result.data.league.matches
        allMatches.push(...matches)
        skipCounter += 100
      } while (matches.length == 100)
      return allMatches
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` matches.service Error fetching matches for league ${leagueId}:`,
        error,
      )
      return []
    }
  }

  async saveMatchesToDatabase(matches: any[]): Promise<void> {
    //console.log('saveMatchesToDatabase ' + JSON.stringify(matches))

    try {
      for (const match of matches) {
        await Match.upsert({
          match_id: match.id,
        })
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' matches.service ERROR saveMatchesToDatabase:',
        error,
      )
    }
  }

  async getMatchesFromDB(): Promise<any> {
    try {
      const matchesEmpty = await Match.findAll({
        where: {
          didradiantwin: null,
        },
      })
      return matchesEmpty
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' matches.service ERROR getMatchesFromDB:',
        error,
      )
    }
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

  async saveMatchPlayerToDB(matchFull: any): Promise<void> {
    console.log('match id ' + matchFull.id)
    try {
      const dataToCreate = matchFull.players.map((player) => ({
        match_id: matchFull.id,
        steamaccountid: String(player.steamAccountId),
        teamid: player.isRadiant
          ? matchFull.radiantTeamId
          : matchFull.direTeamId,
        hero_id: player.hero.id,
        isradiant: player.isRadiant,
        isvictory: player.isVictory,
        playerslot: player.playerSlot,
        lane: player.lane,
        position: player.position,
        durationseconds: matchFull.durationSeconds,
        leaguetier: matchFull.league.tier,
        seriestype: matchFull.series.type,
        startdatetime: matchFull.startDateTime,
        firstbloodtime: matchFull.firstBloodTime,
        //nickname: player.steamAccount.name,
        nickname:
          player.steamAccount?.proSteamAccount.name || player.steamAccount.name,
      }))

      await MatchesPlayers.bulkCreate(dataToCreate)
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' matches.service ERROR saveMatchPlayerToDB:',
        error,
      )
      throw error
    }
  }

  async saveMatchDetailsToDB(matchFull: any): Promise<any> {
    try {
      // Найти соответствующую запись в базе данных по match_id
      const match = await Match.findOne({
        where: {
          match_id: matchFull.id,
        },
      })

      if (!match) {
        this.logger.error(
          new Date().toLocaleString() +
            ` match.service ERROR saveMatchDetailsToDB: Match with id ${matchFull.id} not found.`,
        )
      }

      match.didradiantwin = matchFull.didRadiantWin
      match.durationseconds = matchFull.durationSeconds
      match.startdatetime = matchFull.startDateTime
      match.firstbloodtime = matchFull.firstBloodTime
      match.leaguetier = matchFull.league.tier
      match.leagueid = matchFull.leagueId
      match.radiantteamid = matchFull.radiantTeamId
      match.radiantteamname = matchFull.radiantTeam.name
      match.direteamid = matchFull.direTeamId
      match.direteamname = matchFull.direTeam.name
      match.seriestype = matchFull.series.type

      match.radianthero1 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_1',
        'radiant',
      )
      match.radianthero2 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_2',
        'radiant',
      )
      match.radianthero3 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_3',
        'radiant',
      )
      match.radianthero4 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_4',
        'radiant',
      )
      match.radianthero5 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_5',
        'radiant',
      )

      match.direhero1 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_1',
        'dire',
      )
      match.direhero2 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_2',
        'dire',
      )
      match.direhero3 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_3',
        'dire',
      )
      match.direhero4 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_4',
        'dire',
      )
      match.direhero5 = this.getHeroIdByPosition(
        matchFull,
        'POSITION_5',
        'dire',
      )

      await match.save()
      return match
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' match.service ERROR saveMatchDetailsToDB: ' +
          JSON.stringify(matchFull),
        error,
      )
    }
  }

  private getHeroIdByPosition(matchFull: any, position: string, team: string) {
    try {
      console.log('matchFull.players ' + matchFull.players)
      console.log('position ' + position)
      console.log('team ' + team)
      const isRadiant = team === 'radiant' ? true : false
      const player = matchFull.players.find(
        (player: any) =>
          player.position === position && player.isRadiant === isRadiant,
      )
      console.log('player ' + player)
      return player ? player.hero.id : null
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' match.service ERROR getHeroIdByPosition: ' +
          position,
        error,
      )
    }
  }
}
