import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { QueueService } from './queue.service'
import { QueueController } from './queue.controller'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from '../leagues/leagues.service'

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
          duration: 10, // Waiting time between jobs
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'graphql-to-db', // Название вашей очереди
    }),
  ],
})
export class QueueModule {}

//надо проверить подключение к Redis, а то не видно джобы
