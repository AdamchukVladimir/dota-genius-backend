import { Injectable } from '@nestjs/common'
import { InjectQueue, Process } from '@nestjs/bull'
import { Queue } from 'bull'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('graphql-to-db') private readonly queue: Queue,
    private readonly graphqlService: GraphQLService,
    private readonly leaguesService: LeaguesService,
  ) {}

  async addMatchByLeagueTaskToQueue(data: any): Promise<void> {
    await this.queue.add('processMatchByLeagueTask', data)
  }

  @Process('processMatchByLeagueTask')
  async processMatchByLeagueTask(data: any): Promise<void> {
    try {
      console.log('processMatchByLeagueTask')
      // Выполняйте ваш запрос к GraphQL API через graphqlService
      //const apiResult = await this.graphqlService.makeApiRequest(data);
      // Записывайте результат в базу данных через leaguesService
      //await this.leaguesService.saveDataToDatabase(apiResult);
    } catch (error) {
      console.error('Error processing task:', error)
      // Обработка ошибок
    }
  }

  async getQueueInfo(): Promise<any> {
    return await this.queue.getJobCounts()
  }
}
