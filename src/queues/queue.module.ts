import { Module, OnModuleInit } from '@nestjs/common'
import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { QueueService } from './queue.service'
import { QueueController } from './queue.controller'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'
import * as Bull from 'bull'

@Module({
  controllers: [QueueController],
  providers: [QueueService, GraphQLService, LeaguesService],
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
        limiter: {
          max: 1, // Count of jobs at the same time
          duration: 10000, // Waiting time between jobs
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
        duration: 10000, // Waiting time between jobs
      },
    }

    const queue = new Bull('graphql-to-db', queueOptions)

    queue.process('processMatchByLeagueTask', async (job) => {
      console.log('Processing job:', job.id)
      // add jobs processing here
      // example:
      // await this.queueService.processJob(job.data);
    })

    queue.on('error', (error) => {
      console.error('Queue error:', error)
    })

    queue.on('waiting', () => {
      console.log('Waiting for jobs...')
    })

    queue.on('completed', (job) => {
      console.log('Completed job:', job.id)
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
