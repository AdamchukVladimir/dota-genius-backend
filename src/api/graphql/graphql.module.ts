import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { GraphQLService } from './graphql.service'
import { GraphQLController } from './graphql.controller'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'

@Module({
  controllers: [GraphQLController],
  providers: [GraphQLService],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      //autoSchemaFile: true,
      //playground: true,
      //installSubscriptionHandlers: true,

      //Default dummy query required
      context: ({ req }) => ({ req }),
      typeDefs: `
        type Query {
          dummyQuery: String
        }
      `,
      resolvers: {
        Query: {
          dummyQuery: () => 'Hello, this is a dummy query!',
        },
      },
      //END Default dummy query required
    }),
  ],
})
export class GraphQLModuleApi {}
