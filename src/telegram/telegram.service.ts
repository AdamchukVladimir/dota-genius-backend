import { Inject, Injectable } from '@nestjs/common'
import { Op } from 'sequelize'
import { Match } from 'src/models/match.model'
import { Predictions } from 'src/models/predictions.model'
import { Markup, Telegraf } from 'telegraf'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file
import { PredictionService } from 'src/prediction/prediction.service'
import { MatchesService } from 'src/matches/matches.service'
import { UsersTgService } from 'src/users_tg/users_tg.service'

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf

  constructor(
    private readonly predictionService: PredictionService,
    private readonly matchesService: MatchesService,
    //private readonly usersTgService: UsersTgService,
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
    this.bot.hears('Мой профиль', async (ctx) => this.showProfile(ctx))
    this.bot.action(/^finished_game_(\d+)/, async (ctx) =>
      this.showFinishedGameDetails(ctx),
    )
    this.bot.action('enable_notifications', async (ctx) =>
      this.enableNotifications(ctx),
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
      console.error('TelegramService ERROR showCurrentGames:', error)
      await ctx.reply('Произошла ошибка при получении текущих игр.')
    }
  }

  async showCurrentGameDetails(ctx) {
    const matchId = parseInt(ctx.match[1], 10)
    try {
      const prediction =
        await this.predictionService.getPredictionFromDB(matchId)
      //const match = await this.matchesService.getMatchFromDB(matchId)
      if (prediction) {
        const predictionFirstBloodFormatted = this.getTimeByUnix(
          prediction.prediction_firstblood_result,
        )
        if (prediction.did_radiant_win == null) {
          let message = `Подробности игры:\n`
          message += `Match ID: ${prediction.match_id}\n`

          message += `Команды: ${prediction.radiant_team_name} vs ${prediction.dire_team_name}\n`

          message += `Результат прогноза: ${prediction.prediction_result}\n`
          message += `Прогноз Первая кровь: ${predictionFirstBloodFormatted}\n`
          await ctx.reply(message)
        }
      } else {
        await ctx.reply(`Игра с ID ${matchId} не найдена.`)
      }
    } catch (error) {
      console.error('TelegramService ERROR showCurrentGameDetails:', error)
      await ctx.reply(
        'Произошла ошибка при получении подробностей текущей игры.',
      )
    }
  }

  async showRecentGames(ctx) {
    try {
      const predictions =
        await this.predictionService.getFinishedPredictionFromDB()
      let message = 'Недавние игры:\n'
      const inlineKeyboard = Markup.inlineKeyboard(
        predictions.map((prediction, index) => {
          let buttonText = ''

          console.log('matchesDetails[index] ' + predictions[index])
          if (prediction.did_radiant_win) {
            buttonText = `🟢 ${predictions[index].radiant_team_name} vs ${predictions[index].dire_team_name}`
          } else {
            buttonText = `${predictions[index].radiant_team_name} vs ${predictions[index].dire_team_name} 🔴`
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
      console.error('TelegramService ERROR showRecentGames:', error)
      await ctx.reply('Произошла ошибка при получении недавних игр.')
    }
  }

  async showFinishedGameDetails(ctx) {
    try {
      const matchId = parseInt(ctx.match[1], 10)
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
      console.error('TelegramService ERROR showFinishedGameDetails:', error)
      await ctx.reply('Произошла ошибка при получении подробностей игры.')
    }
  }

  async showProfile(ctx) {
    try {
      return ctx.reply(
        'Мой профиль:',
        Markup.inlineKeyboard([
          Markup.button.callback(
            'Включить уведомления',
            'enable_notifications',
          ),
        ]),
      )
    } catch (error) {
      console.error('TelegramService ERROR showProfile:', error)
      await ctx.reply('Произошла ошибка при настройке профиля.')
    }
  }

  async enableNotifications(ctx) {
    try {
      await ctx.reply('Уведомления включены!')
    } catch (error) {
      console.error('TelegramService ERROR enableNotifications:', error)
      await ctx.reply('Произошла ошибка при включении оповещений.')
    }
  }

  // async handleUserInteraction(chatId: number) {
  //   // Проверяем, есть ли пользователь уже в базе данных
  //   const existingUser = await this.usersTgService.findUserByChatId(chatId)

  //   if (existingUser) {
  //     // Пользователь уже существует
  //     console.log('Пользователь уже существует:', existingUser)
  //   } else {
  //     // Создаем нового пользователя
  //     const newUser = await this.usersTgService.createUser({ chatId })
  //     console.log('Новый пользователь создан:', newUser)
  //   }
  // }

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
