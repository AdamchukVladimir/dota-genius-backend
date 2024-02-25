import { Controller, Get } from '@nestjs/common'
import { PredictionService } from './prediction.service'

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('live')
  async fetchAllLiveMatches(): Promise<any> {
    const liveMatches = await this.predictionService.fetchAllLiveMatches()
    return liveMatches
  }

  @Get('prediction')
  async processPredictions(): Promise<any> {
    return await this.predictionService.processPredictions()
  }
}
