import { Inject, Injectable } from '@nestjs/common'
import { Op } from 'sequelize'
import { Match } from 'src/models/match.model'
import { Predictions } from 'src/models/predictions.model'
import { Markup, Telegraf } from 'telegraf'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { PredictionService } from 'src/prediction/prediction.service'
import { MatchesService } from 'src/matches/matches.service'

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf

  constructor(
    private readonly predictionService: PredictionService,
    private readonly matchesService: MatchesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
    this.setupListeners()
  }

  private setupListeners() {
    // command handler
    //this.bot.start((ctx) => ctx.reply('Привет! Это мой телеграм-бот.'))
    this.bot.start((ctx) => this.showMainMenu(ctx))
    this.bot.hears('Недавние игры', async (ctx) => this.showRecentGames(ctx))
    this.bot.hears('Текущие игры', async (ctx) => this.showCurrentGames(ctx))
    this.bot.action(/^finished_game_(\d+)/, async (ctx) =>
      this.showFinishedGameDetails(ctx),
    )
  }

  async sendMessage(chatId: number, text: string) {
    await this.bot.telegram.sendMessage(chatId, text)
  }

  async showMainMenu(ctx) {
    return ctx.reply(
      'Выберите действие:',
      Markup.keyboard([
        ['Мой профиль'],
        ['Текущие игры'],
        ['Недавние игры'],
      ]).resize(),
    )
  }

  async showCurrentGames(ctx) {
    try {
      const predictions =
        await this.predictionService.getCurrentPredictionFromDB() // Получаем последние 5 записей из таблицы Predictions
      console.log('current ' + JSON.stringify(predictions))
      let message = 'Текущие игры:\n'
      let matchesDetails = []

      const inlineKeyboard = Markup.inlineKeyboard(
        predictions.map((prediction, index) => {
          let buttonText = ''

          buttonText = ` ${prediction?.radiant_team_name || prediction?.radiant_team_id} vs ${prediction?.dire_team_name || prediction?.dire_team_id}`

          return [
            Markup.button.callback(
              buttonText,
              `current_game_${prediction.match_id}`,
            ),
          ]
        }),
      )
      await ctx.reply(message, inlineKeyboard)
    } catch (error) {
      console.error('Ошибка при получении текущих игр:', error)
      await ctx.reply('Произошла ошибка при получении текущих игр.')
    }
  }

  async showRecentGames(ctx) {
    try {
      const predictions =
        await this.predictionService.getFinishedPredictionFromDB()
      let message = 'Недавние игры:\n'
      let matchesDetails = []
      for (const prediction of predictions) {
        const matchDetails = await this.matchesService.getMatchFromDB(
          prediction.match_id,
        )
        matchesDetails.push(matchDetails)
        //message += `Match ID: ${prediction.match_id}\n\n`
      }
      const inlineKeyboard = Markup.inlineKeyboard(
        predictions.map((prediction, index) => {
          let buttonText = ''

          if (prediction.did_radiant_win) {
            buttonText = `🟢 ${matchesDetails[index].radiantteamname} vs ${matchesDetails[index].direteamname}`
          } else {
            buttonText = `${matchesDetails[index].radiantteamname} vs ${matchesDetails[index].direteamname} 🔴`
          }

          return [
            Markup.button.callback(
              buttonText,
              `finished_game_${prediction.match_id}`,
            ),
          ]
        }),
      )
      await ctx.reply(message, inlineKeyboard)
    } catch (error) {
      console.error('Ошибка при получении недавних игр:', error)
      await ctx.reply('Произошла ошибка при получении недавних игр.')
    }
  }

  async showFinishedGameDetails(ctx) {
    const matchId = parseInt(ctx.match[1], 10)
    try {
      const prediction =
        await this.predictionService.getPredictionFromDB(matchId)
      const match = await this.matchesService.getMatchFromDB(matchId)
      if (prediction && match) {
        const firstBloodTimeFormatted = this.getTimeByUnix(
          prediction.firstblood_time,
        )
        const predictionFirstBloodFormatted = this.getTimeByUnix(
          prediction.prediction_firstblood_result,
        )
        if (match.did_radiant_win !== null) {
          let message = `Подробности игры:\n`
          message += `Match ID: ${prediction.match_id}\n`
          if (prediction.did_radiant_win) {
            message += `Команды: ✔️${match.radiantteamname} vs ${match.direteamname}\n`
          } else {
            message += `Команды: ${match.radiantteamname} vs ${match.direteamname}✔️\n`
          }
          message += `Первая кровь: ${firstBloodTimeFormatted}\n`
          message += `Результат прогноза: ${prediction.prediction_result}\n`
          message += `Прогноз Первая кровь: ${predictionFirstBloodFormatted}\n`
          await ctx.reply(message)
        }
      } else {
        await ctx.reply(`Игра с ID ${matchId} не найдена.`)
      }
    } catch (error) {
      console.error('Ошибка при получении подробностей игры:', error)
      await ctx.reply('Произошла ошибка при получении подробностей игры.')
    }
  }

  getTimeByUnix(time: number): string {
    const TimeMsec = new Date(time * 1000)
    const timeFormatted = [
      String(TimeMsec.getUTCHours()).padStart(2, '0'),
      String(TimeMsec.getUTCMinutes()).padStart(2, '0'),
      String(TimeMsec.getUTCSeconds()).padStart(2, '0'),
    ].join(':')

    return timeFormatted
  }

  startBot() {
    this.bot.launch()
  }

  stopBot() {
    this.bot.stop()
  }

  async onModuleInit() {
    // start Bot when module is loaded
    this.startBot()
  }
}
