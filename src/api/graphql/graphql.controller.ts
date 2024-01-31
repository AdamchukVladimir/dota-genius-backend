import { Controller, Get } from '@nestjs/common'
import { GraphQLService } from './graphql.service'

@Controller('graphql')
export class GraphQLController {
  constructor(private readonly graphQLService: GraphQLService) {}
}
