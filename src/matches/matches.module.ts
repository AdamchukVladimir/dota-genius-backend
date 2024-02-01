import { Module } from '@nestjs/common'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'
import { LeaguesService } from 'src/leagues/leagues.service'
import { GraphQLService } from 'src/api/graphql/graphql.service'

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, LeaguesService, GraphQLService],
})
export class MatchesModule {}
