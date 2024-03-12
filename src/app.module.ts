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
import { MatchesPlayers } from './models/matchesplayers.model'
import { SqlReloaderModule } from './sql_reloader/sql_reloader.module'
import { PredictionModule } from './prediction/prediction.module'
import { Heroes } from './models/heroes.model'
import { Predictions } from './models/predictions.model'
import { HeroesWith } from './models/heroeswith.model'
import { HeroesAVG } from './models/heroesavg.model'
import { TeamHeroes } from './models/teamheroes.model'
import { TeamHeroesVersus } from './models/teamheroesversus.model'
import { TeamsVsTeams } from './models/temsvsteams.model'
import { Team } from './models/teams.model'
import { Players } from './models/players.model'
import { TelegramModule } from './telegram/telegram.module';
import { UsersTgModule } from './users_tg/users_tg.module';

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
      models: [
        Token,
        League,
        Match,
        MatchesPlayers,
        Heroes,
        Predictions,
        HeroesWith,
        HeroesAVG,
        TeamHeroes,
        TeamHeroesVersus,
        TeamsVsTeams,
        Team,
        Players,
      ], //import sequilize postgres model
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
    SqlReloaderModule, // Reloader clear SQL queries
    PredictionModule, TelegramModule, UsersTgModule,
  ],
})
export class AppModule {}
