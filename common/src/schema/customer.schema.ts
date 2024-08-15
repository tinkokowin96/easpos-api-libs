import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { AppProp } from '@common/decorator/app_prop.decorator';
import { SchemaTypes } from 'mongoose';
import { CustomerTier } from '../../../../src/customer_tier/customer_tier.schema';
import { User } from '@common/schema/user.schema';
import { Type } from 'class-transformer';
import { AllowanceBenefit } from '../../../../src/allowance/allowance.schema';
import { IsMongoId, IsOptional, ValidateNested } from 'class-validator';

class CustomerDiscount {
   @ValidateNested()
   @Type(() => AllowanceBenefit)
   discount: AllowanceBenefit;

   @IsOptional()
   @IsMongoId()
   usage: string; //NOTE: AuditLog
}

@Schema()
export class Customer extends User {
   @AppProp({ type: SchemaTypes.ObjectId, ref: 'CustomerTier', required: false })
   tier?: CustomerTier;

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Merchant' })
   merchant: Merchant;

   @AppProp({ type: SchemaTypes.Mixed, required: false })
   @Type(() => AllowanceBenefit)
   point: AllowanceBenefit[];

   @AppProp({ type: SchemaTypes.Mixed, required: false })
   @Type(() => AllowanceBenefit)
   cash: AllowanceBenefit[];

   @AppProp({ type: SchemaTypes.Mixed, required: false })
   @Type(() => CustomerDiscount)
   discounts: CustomerDiscount[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);