import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { LeaguesService } from 'src/leagues/leagues.service'
import { GraphQLService } from 'src/api/graphql/graphql.service'
import { QueueService } from 'src/queues/queue.service'
import { BullModule } from '@nestjs/bull'

// some weird stuff
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'graphql-to-db',
    }),
  ],
  controllers: [MatchesController],
  providers: [MatchesService, LeaguesService, GraphQLService, QueueService],
})
export class MatchesModule {}
