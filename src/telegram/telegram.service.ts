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
    this.bot.action(/^game_(\d+)/, async (ctx) => this.showGameDetails(ctx))
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

  async showRecentGames(ctx) {
    try {
      const predictions = await Predictions.findAll({ limit: 5 }) // Получаем последние 5 записей из таблицы Predictions
      let message = 'Недавние игры:\n'
      predictions.forEach((prediction, index) => {
        message += `${index + 1}. Команды: ${prediction.radiant_team_id} vs ${prediction.dire_team_id}\n`
        message += `Match ID: ${prediction.match_id}\n\n`
      })
      const inlineKeyboard = Markup.inlineKeyboard(
        predictions.map((prediction, index) => [
          Markup.button.callback(
            `Игра ${index + 1}`,
            `game_${prediction.match_id}`,
          ),
        ]),
      )
      await ctx.reply(message, inlineKeyboard)
    } catch (error) {
      console.error('Ошибка при получении недавних игр:', error)
      await ctx.reply('Произошла ошибка при получении недавних игр.')
    }
  }

  async showGameDetails(ctx) {
    const matchId = parseInt(ctx.match[1], 10)
    try {
      const prediction =
        await this.predictionService.getPredictionFromDB(matchId)
      const match = await this.matchesService.getMatchFromDB(matchId)
      if (prediction && match) {
        if (match.did_radiant_win !== null) {
          let message = `Подробности игры:\n`
          message += `Команды: ${match.radiantteamname} vs ${match.direteamname}\n`
          message += `Match ID: ${prediction.match_id}\n`
          message += `Результат прогноза: ${prediction.prediction_result}\n`
          message += `Первая кровь: ${prediction.prediction_firstblood_result}\n`
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

  //   async showRecentGames(ctx) {
  //     try {
  //       const predictions = await Predictions.findAll({ limit: 5 }) // Получаем последние 5 записей из таблицы Predictions
  //       let message = 'Недавние игры:\n'
  //       predictions.forEach((prediction) => {
  //         message += `Команды: ${prediction.radiant_team_id} vs ${prediction.dire_team_id}\n`
  //         message += `Match ID: ${prediction.match_id}\n`
  //         message += `Результат прогноза: ${prediction.prediction_result}\n`
  //         message += `Первая кровь: ${prediction.prediction_firstblood_result}\n\n`
  //       })
  //       await ctx.reply(message)
  //     } catch (error) {
  //       console.error('Ошибка при получении недавних игр:', error)
  //       await ctx.reply('Произошла ошибка при получении недавних игр.')
  //     }
  //   }

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
