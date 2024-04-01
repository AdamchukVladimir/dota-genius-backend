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
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf

  constructor(
    private readonly predictionService: PredictionService,
    private readonly matchesService: MatchesService,
    private readonly usersTgService: UsersTgService,
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
    this.bot.action(/^current_game_(\d+)/, async (ctx) =>
      this.showCurrentGameDetails(ctx),
    )
    this.bot.action('enable_notifications', async (ctx) =>
      this.enableNotifications(ctx),
    )
    this.bot.action('disable_notifications', async (ctx) =>
      this.disableNotifications(ctx),
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
      if (predictions == 0) {
        message =
          'В настоящий момент нет соревновательных матчей\n' +
          `Вы можете включить уведомления о новых матчах в разделе "Мой профиль"`
      }

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
        const predictionFirstBloodFormatted =
          prediction.prediction_firstblood_result != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_result)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodHeroesFormatted =
          prediction.prediction_firstblood_heroes != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_heroes)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodTeamsFormatted =
          prediction.prediction_firstblood_teams != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_teams)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodPlayersFormatted =
          prediction.prediction_firstblood_players != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_players)
            : 'Не удалось рассчитать данные'
        if (prediction.did_radiant_win == null) {
          let message = `Подробности игры:\n`
          message += `Match ID: ${prediction.match_id}\n`

          message += `Команды: ${prediction.radiant_team_name} vs ${prediction.dire_team_name}\n`

          message += `Результат прогноза: ${(prediction.prediction_result * 100).toFixed(2) + '%'}\n`
          message += `Прогноз Первая кровь: ${predictionFirstBloodFormatted}\n\n`
          message += `Прогноз Первая кровь по героям: ${predictionFirstBloodHeroesFormatted}\n`
          message += `Прогноз Первая кровь по командам: ${predictionFirstBloodTeamsFormatted}\n`
          message += `Прогноз Первая кровь по игрокам: ${predictionFirstBloodPlayersFormatted}\n\n`

          message += `Ср.Винрейт по героям: ${prediction.prediction_heroes_avg != null && prediction.prediction_heroes_avg != 0.5 ? (prediction.prediction_heroes_avg * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом сторон: ${prediction.prediction_heroes_avg_sides != null && prediction.prediction_heroes_avg_sides != 0.5 ? (prediction.prediction_heroes_avg_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями: ${prediction.prediction_heroes != null && prediction.prediction_heroes != 0.5 ? (prediction.prediction_heroes * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями с учетом сторон: ${prediction.prediction_heroes_sides != null && prediction.prediction_heroes_sides != 0.5 ? (prediction.prediction_heroes_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт с союзными героями: ${prediction.prediction_heroes_with != null && prediction.prediction_heroes_with != 0.5 ? (prediction.prediction_heroes_with * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт с союзными героями с учетом сторон: ${prediction.prediction_heroes_with_sides != null && prediction.prediction_heroes_with_sides != 0.5 ? (prediction.prediction_heroes_with_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом позиций: ${prediction.prediction_heroes_positions != null && prediction.prediction_heroes_positions != 0.5 ? (prediction.prediction_heroes_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом команды: ${prediction.prediction_team_heroes != null && prediction.prediction_team_heroes != 0.5 ? (prediction.prediction_team_heroes * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями с учетом команды: ${prediction.prediction_team_heroes_versus != null && prediction.prediction_team_heroes_versus != 0.5 ? (prediction.prediction_team_heroes_versus * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт команд: ${prediction.prediction_teams_avg != null && prediction.prediction_teams_avg != 0.5 ? (prediction.prediction_teams_avg * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт между командами: ${prediction.prediction_team_vs_team != null && prediction.prediction_team_vs_team != 0.5 ? (prediction.prediction_team_vs_team * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков: ${prediction.prediction_players != null && prediction.prediction_players != 0.5 ? (prediction.prediction_players * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков с учетом позиций: ${prediction.prediction_players_positions != null && prediction.prediction_players_positions != 0.5 ? (prediction.prediction_players_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков с учетом позиций: ${prediction.prediction_players_positions != null && prediction.prediction_players_positions != 0.5 ? (prediction.prediction_players_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`

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
      // if (prediction && match) {
      if (prediction) {
        const firstBloodTimeFormatted = this.getTimeByUnix(
          prediction.firstblood_time,
        )
        const predictionFirstBloodFormatted =
          prediction.prediction_firstblood_result != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_result)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodHeroesFormatted =
          prediction.prediction_firstblood_heroes != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_heroes)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodTeamsFormatted =
          prediction.prediction_firstblood_teams != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_teams)
            : 'Не удалось рассчитать данные'
        const predictionFirstBloodPlayersFormatted =
          prediction.prediction_firstblood_players != null
            ? this.getTimeByUnix(prediction.prediction_firstblood_players)
            : 'Не удалось рассчитать данные'
        if (prediction.did_radiant_win !== null) {
          let message = `Подробности игры:\n`
          message += `Match ID: ${prediction.match_id}\n`
          if (prediction.did_radiant_win) {
            message += `Команды: ✔️${prediction.radiant_team_name} vs ${prediction.dire_team_name}\n`
          } else {
            message += `Команды: ${prediction.radiant_team_name} vs ${prediction.dire_team_name}✔️\n`
          }
          message += `Первая кровь: ${firstBloodTimeFormatted}\n`
          message += `Результат прогноза: ${prediction.prediction_result}\n`
          message += `Прогноз Первая кровь: ${predictionFirstBloodFormatted}\n\n`

          message += `Прогноз Первая кровь по героям: ${predictionFirstBloodHeroesFormatted}\n`
          message += `Прогноз Первая кровь по командам: ${predictionFirstBloodTeamsFormatted}\n`
          message += `Прогноз Первая кровь по игрокам: ${predictionFirstBloodPlayersFormatted}\n\n`

          message += `Ср.Винрейт по героям: ${prediction.prediction_heroes_avg != null && prediction.prediction_heroes_avg != 0.5 ? (prediction.prediction_heroes_avg * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом сторон: ${prediction.prediction_heroes_avg_sides != null && prediction.prediction_heroes_avg_sides != 0.5 ? (prediction.prediction_heroes_avg_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями: ${prediction.prediction_heroes != null && prediction.prediction_heroes != 0.5 ? (prediction.prediction_heroes * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями с учетом сторон: ${prediction.prediction_heroes_sides != null && prediction.prediction_heroes_sides != 0.5 ? (prediction.prediction_heroes_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт с союзными героями: ${prediction.prediction_heroes_with != null && prediction.prediction_heroes_with != 0.5 ? (prediction.prediction_heroes_with * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт с союзными героями с учетом сторон: ${prediction.prediction_heroes_with_sides != null && prediction.prediction_heroes_with_sides != 0.5 ? (prediction.prediction_heroes_with_sides * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом позиций: ${prediction.prediction_heroes_positions != null && prediction.prediction_heroes_positions != 0.5 ? (prediction.prediction_heroes_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по героям с учетом команды: ${prediction.prediction_team_heroes != null && prediction.prediction_team_heroes != 0.5 ? (prediction.prediction_team_heroes * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт по противостоянию между героями с учетом команды: ${prediction.prediction_team_heroes_versus != null && prediction.prediction_team_heroes_versus != 0.5 ? (prediction.prediction_team_heroes_versus * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт команд: ${prediction.prediction_teams_avg != null && prediction.prediction_teams_avg != 0.5 ? (prediction.prediction_teams_avg * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт между командами: ${prediction.prediction_team_vs_team != null && prediction.prediction_team_vs_team != 0.5 ? (prediction.prediction_team_vs_team * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков: ${prediction.prediction_players != null && prediction.prediction_players != 0.5 ? (prediction.prediction_players * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков с учетом позиций: ${prediction.prediction_players_positions != null && prediction.prediction_players_positions != 0.5 ? (prediction.prediction_players_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`
          message += `Ср.Винрейт игроков с учетом позиций: ${prediction.prediction_players_positions != null && prediction.prediction_players_positions != 0.5 ? (prediction.prediction_players_positions * 100).toFixed(2) + '%' : 'Не удалось рассчитать данные'}\n`

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
      let buttonText = 'Включить уведомления о новых матчах'
      let toggleNotification = 'enable_notifications'
      const userTg = await this.usersTgService.findUserByChatId(ctx.chat.id)
      if (userTg) {
        if (userTg.notificationOn) {
          buttonText = 'Отключить уведомления о новых матчах'
          toggleNotification = 'disable_notifications'
        }
      }

      return ctx.reply(
        'Мой профиль:',
        Markup.inlineKeyboard([
          Markup.button.callback(buttonText, toggleNotification),
        ]),
      )
    } catch (error) {
      console.error('TelegramService ERROR showProfile:', error)
      await ctx.reply('Произошла ошибка при настройке профиля.')
    }
  }

  async enableNotifications(ctx) {
    try {
      const userData = {
        chatId: ctx.chat.id,
        username: ctx.chat.username,
        firstname: ctx.chat.first_name,
        notificationOn: true,
      }
      await this.usersTgService.createOrReplaceUser(userData)
      await ctx.reply('Уведомления включены!')
    } catch (error) {
      console.error('TelegramService ERROR enableNotifications:', error)
      await ctx.reply('Произошла ошибка при включении оповещений.')
    }
  }

  async disableNotifications(ctx) {
    try {
      const userData = {
        chatId: ctx.chat.id,
        username: ctx.chat.username,
        firstname: ctx.chat.first_name,
        notificationOn: false,
      }
      await this.usersTgService.createOrReplaceUser(userData)
      await ctx.reply('Уведомления отключены!')
    } catch (error) {
      console.error('TelegramService ERROR disableNotifications:', error)
      await ctx.reply('Произошла ошибка при отключении оповещений.')
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndSendNotifications() {
    try {
      console.log('checkAndSendNotifications')
      const newPredictions = await Predictions.findAll({
        where: {
          did_radiant_win: null,
          [Op.or]: [{ notified: null }, { notified: false }],
        },
        //include: [{ model: UserTG, where: { notificationOn: true } }],
      })

      for (const prediction of newPredictions) {
        await this.sendNotificationToUser(prediction)
        await this.predictionService.setNotifiedToPrediction(
          prediction.match_id,
        )
      }
    } catch (error) {
      console.error('TelegramService ERROR checkAndSendNotifications:', error)
      this.logger.error(
        new Date().toLocaleString() +
          ' TelegramService checkAndSendNotifications ERROR: ',
        error,
      )
    }
  }

  async sendNotificationToUser(prediction: any): Promise<any> {
    try {
      const usersToNotify = await this.usersTgService.findAllUsersNotifyOn()
      let message = `Начался матч:\n`
      message += `Match ID: ${prediction.match_id}\n`
      message += `Команды: ${prediction.radiant_team_name} vs ${prediction.dire_team_name}\n`
      message += `Подробности в разделе Текущие игры`

      for (const userToNotify of usersToNotify) {
        await this.sendMessage(userToNotify.chatId, message)
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' UsersTgService sendNotificationToUser Error:',
        error,
      )
      throw error
    }
  }

  getTimeByUnix(time: number): string {
    const isNegative = time < 0
    const absTime = Math.abs(time)
    const TimeMsec = new Date(absTime * 1000)

    const hours = String(TimeMsec.getUTCHours()).padStart(2, '0')
    const minutes = String(TimeMsec.getUTCMinutes()).padStart(2, '0')
    const seconds = String(TimeMsec.getUTCSeconds()).padStart(2, '0')

    let timeFormatted = `${hours}:${minutes}:${seconds}`

    if (isNegative) {
      timeFormatted = '-' + timeFormatted
    }

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
