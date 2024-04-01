import { Controller, Post } from '@nestjs/common'
import { TelegramService } from './telegram.service'

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}
  @Post('sendNotification')
  async checkAndSendNotifications(): Promise<any> {
    await this.telegramService.checkAndSendNotifications()
  }
}
