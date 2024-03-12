import { Module } from '@nestjs/common';
import { UsersTgService } from './users_tg.service';
import { UsersTgController } from './users_tg.controller';

@Module({
  providers: [UsersTgService],
  controllers: [UsersTgController]
})
export class UsersTgModule {}
