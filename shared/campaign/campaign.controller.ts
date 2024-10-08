import AppController from '@common/decorator/app_controller.decorator';
import { EAllowedUser, ECategory } from '@common/utils/enum';
import { Body, Post } from '@nestjs/common';
import { CreateCampaignDto } from './campaign.dto';
import CoreController from '@common/core/core.controller';
import CampaignService from './campaign.service';

@AppController('campaign', { admin: [EAllowedUser.Admin], user: [EAllowedUser.Merchant] })
export default class CampaignController extends CoreController {
   constructor(protected readonly service: CampaignService) {
      super();
   }

   @Post('create')
   create(@Body() { category, ...dto }: CreateCampaignDto) {
      return this.service.create({
         ...dto,
         ...(category
            ? {
                 category: { ...category, type: ECategory.Campaign },
              }
            : {}),
      });
   }
}
