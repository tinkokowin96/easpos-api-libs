import { Merchant } from '@common/schema/merchant.schema';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CategoryDto } from './action.dto';
import { CoreDto, FindByIdDto } from './core.dto';
import { CreateUserDto } from './user.dto';

export class CreateMerchantDto extends OmitType(CoreDto(Merchant), [
   'activePurchase',
   'owner',
   'status',
   'type',
]) {
   @IsNotEmpty()
   @ValidateNested()
   @Type(() => CategoryDto)
   category: CategoryDto;

   @IsNotEmpty()
   @ValidateNested()
   @Type(() => CreateUserDto)
   user: CreateUserDto;
}

type MerchantReturn = { data: Merchant };

export interface MerchantServiceMethods {
   getMerchant(dto: FindByIdDto): Promise<MerchantReturn>;

   merchantWithAuth(dto: FindByIdDto): Promise<{
      data: {
         merchant: Merchant;
         isSubActive: boolean;
      };
   }>;

   createMerchant(dto: CreateMerchantDto): Promise<MerchantReturn>;

   tmpTst(): { data: string };
}
