import { Module, OnModuleInit, Inject } from '@nestjs/common'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { QueueService } from './queue.service'
import { QueueController } from './queue.controller'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'
import { MatchesService } from '../matches/matches.service'
import * as Bull from 'bull'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file

@Module({
  controllers: [QueueController],
  providers: [QueueService, GraphQLService, LeaguesService, MatchesService],
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'graphql-to-db', // Queue name
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
    }

    const queueOptions: Bull.QueueOptions = {
      redis: redisConfig,
      limiter: {
        max: 1, // Count of jobs at the same time
        duration: 3000, // Waiting time between jobs 1sec
      },
    }

    const queue = new Bull('graphql-to-db', queueOptions)

    // jobs processing
    queue.process('processMatchesByLeagueTask', async (job) => {
      //console.log('Processing job:', job.id)

      await this.queueService.processMatchesByLeagueTask(job.data)
    })

    queue.process('processReloadMatchDetailsTask', async (job) => {
      console.log('Processing processMatchesByLeagueTask job:', job.id)
      this.logger.info(
        new Date().toLocaleString() +
          ' Processing processMatchesByLeagueTask job: ' +
          job.id,
      )
      await this.queueService.processReloadMatchDetailsTask(job.data)
    })

    queue.on('error', (error) => {
      //console.error('Queue error:', error)
    })

    queue.on('waiting', () => {
      //console.log('Waiting for jobs...')
    })

    queue.on('completed', (job) => {
      //console.log('Completed job:', job.id)
    })

    queue.on('failed', (job, error) => {
      console.error('Failed job:', job.id, error)
    })

    queue.on('paused', () => {
      console.log('Queue paused')
    })

    queue.on('resumed', () => {
      console.log('Queue resumed')
    })

    queue.on('stalled', (job) => {
      console.log('Stalled job:', job.id)
    })
  }
}
