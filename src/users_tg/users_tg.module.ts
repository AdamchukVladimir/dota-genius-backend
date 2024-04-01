import { Module } from '@nestjs/common'
import { UsersTgService } from './users_tg.service'
import { UsersTgController } from './users_tg.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserTG } from 'src/models/userstg.model'

@Module({
  providers: [UsersTgService],
  controllers: [UsersTgController],
  imports: [SequelizeModule.forFeature([UserTG])],
})
export class UsersTgModule {}
