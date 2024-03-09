import { Module } from '@nestjs/common'
import { TelegramService } from './telegram.service'
import { TelegramController } from './telegram.controller'
import { PredictionService } from 'src/prediction/prediction.service'
import { GraphQLService } from 'src/api/graphql/graphql.service'
import { MatchesService } from 'src/matches/matches.service'
import { LeaguesService } from 'src/leagues/leagues.service'
import { QueueService } from 'src/queues/queue.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'graphql-to-db',
    }),
  ],
  providers: [
    TelegramService,
    PredictionService,
    GraphQLService,
    MatchesService,
    LeaguesService,
    QueueService,
  ],
  controllers: [TelegramController],
})
export class TelegramModule {}
