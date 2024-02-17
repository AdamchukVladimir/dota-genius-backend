import { Module } from '@nestjs/common'
import { GraphQLService } from '../api/graphql/graphql.service'
import { LeaguesService } from './leagues.service'
import { LeaguesController } from './leagues.controller'
import { MatchesService } from 'src/matches/matches.service'

@Module({
  providers: [GraphQLService, LeaguesService],
  controllers: [LeaguesController],
})
export class LeaguesModule {}
