import { Module } from '@nestjs/common'
import { SqlReloaderService } from './sql_reloader.service'
import { SqlReloaderController } from './sql_reloader.controller'

@Module({
  providers: [SqlReloaderService],
  controllers: [SqlReloaderController],
})
export class SqlReloaderModule {}
