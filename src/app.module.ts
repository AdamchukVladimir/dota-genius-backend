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

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    GraphQLModuleApi,
    LeaguesModule,
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
      models: [Token, League], //import postgres model
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
    ScheduleModule.forRoot(), // Cron scheduler
  ],
})
export class AppModule {}
