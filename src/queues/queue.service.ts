import { Injectable } from '@nestjs/common'
import { InjectQueue, Process } from '@nestjs/bull'
import { Queue } from 'bull'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'
//import { MatchesService } from 'src/matches/matches.service'

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('graphql-to-db') private readonly queue: Queue,
    private readonly graphqlService: GraphQLService,
    private readonly leaguesService: LeaguesService,
    //private readonly MatchesService: MatchesService,
  ) {}

  async addMatchByLeagueTaskToQueue(leagueId: any): Promise<void> {
    await this.queue.add('processMatchesByLeagueTask', leagueId)
  }

  @Process('processMatchesByLeagueTask')
  async processMatchesByLeagueTask(leagueId: any): Promise<void> {
    try {
      console.log('processMatchesByLeagueTask')
      // req to stratz graphqlService
      //const apiResult = await this.graphqlService.makeApiRequest(data);
      // save to db leaguesService
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
