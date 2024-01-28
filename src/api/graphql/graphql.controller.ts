import { Controller, Get } from '@nestjs/common'
import { GraphQLService } from './graphql.service'

@Controller('graphql')
export class GraphQLController {
  constructor(private readonly graphQLService: GraphQLService) {}

  @Get('data')
  async getData() {
    try {
      const graphqlData = await this.graphQLService.fetchLeagues()
      // Обработка данных, возвращенных из GraphQL-запроса
      return graphqlData
    } catch (error) {
      // Обработка ошибок, если что-то пошло не так при выполнении запроса
      return { error: 'Failed to fetch data from GraphQL API' }
    }
  }
}
