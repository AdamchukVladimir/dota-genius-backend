import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { LeaguesService } from 'src/leagues/leagues.service'
import { GraphQLService } from 'src/api/graphql/graphql.service'
import { QueueService } from 'src/queues/queue.service'
import { BullModule } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'

// some weird stuff
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
  controllers: [MatchesController],
  providers: [MatchesService, LeaguesService, GraphQLService, QueueService],
})
export class MatchesModule {}
