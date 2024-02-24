import { Controller, Post, Get } from '@nestjs/common'
import { QueueService } from './queue.service'

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('add-tasks')
  async addTasksToQueue(): Promise<string> {
    // Добавить первую задачу в очередь
    await this.queueService.addMatchByLeagueTaskToQueue({ message: 'Тест1' })

    // Добавить вторую задачу в очередь
    await this.queueService.addMatchByLeagueTaskToQueue({ message: 'Тест2' })

    return 'Задачи успешно добавлены в очередь'
  }
  @Get('info')
  async getQueueInfo(): Promise<any> {
    return await this.queueService.getQueueInfo()
  }

  @Get('jobs')
  async getAllJobs(): Promise<any> {
    return await this.queueService.getAllJobs()
  }
}
