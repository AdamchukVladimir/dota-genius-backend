import { Module } from '@nestjs/common'
import { PredictionService } from './prediction.service'
import { PredictionController } from './prediction.controller'
import { GraphQLService } from 'src/api/graphql/graphql.service'
import { MatchesService } from 'src/matches/matches.service'
import { LeaguesService } from 'src/leagues/leagues.service'
import { QueueService } from 'src/queues/queue.service'
import { BullModule } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'

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
    PredictionService,
    GraphQLService,
    MatchesService,
    LeaguesService,
    QueueService,
  ],
  controllers: [PredictionController],
})
export class PredictionModule {}
