import { Module } from '@nestjs/common'
import { PredictionService } from './prediction.service'
import { PredictionController } from './prediction.controller'
import { GraphQLService } from 'src/api/graphql/graphql.service'

@Module({
  providers: [PredictionService, GraphQLService],
  controllers: [PredictionController],
})
export class PredictionModule {}
