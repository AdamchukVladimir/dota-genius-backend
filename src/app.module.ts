import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModuleApi } from './api/graphql/graphql.module'
import { LeaguesModule } from './leagues/leagues.module'
import { Token } from './api/graphql/token/token.model'
import { League } from './models/league.model'
import { WinstonModule } from 'nest-winston' //loger to file
import * as winston from 'winston' //logger to file
import { ScheduleModule } from '@nestjs/schedule' //Cron scheduler
import { MatchesModule } from './matches/matches.module'
import { QueueModule } from './queues/queue.module'
import { Match } from './models/match.model'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      database: process.env.POSTGRESS_DB,
      models: [Token, League, Match], //import postgres model
      //autoLoadModels: true,
      //synchronize: true,
    }),
    WinstonModule.forRoot({
      //logger to file
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
      ],
    }),
    GraphQLModuleApi,
    LeaguesModule,
    ScheduleModule.forRoot(), // Cron scheduler
    MatchesModule,
    QueueModule, // Redis
  ],
})
export class AppModule {}
