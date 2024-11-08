import { SchemaTypes } from 'mongoose';
import { ValidateIf } from 'class-validator';
import { Amount, ProductPurchased, TimeRange } from '@common/dto/entity.dto';
import { EAllowance, EStatus } from '@common/utils/enum';
import BaseSchema from '@common/core/base.schema';
import AppProp from '@common/decorator/app_prop.decorator';
import Address from '../address/address.schema';
import Campaign from '../campaign/campaign.schema';
import Category from '../category/category.schema';
import Unit from '../unit/unit.schema';

//TODO: validate not to exceed 100% discount
export default abstract class Allowance extends BaseSchema {
   abstract benefit: any;
   abstract type: EAllowance;
   tierTrigger?: any[];

   @AppProp({ type: Number })
   numAllowance: number;

   @AppProp({ type: Boolean })
   autoTrigger: boolean;

   @ValidateIf((o) => o.autoTrigger)
   @AppProp({ type: Boolean, default: false })
   canKeep: boolean;

   @AppProp({ type: String })
   name: string;

   @AppProp({ type: String, required: false })
   description?: string;

   @AppProp({ type: Boolean })
   perProduct: boolean;

   @AppProp({ type: String, enum: EStatus, default: EStatus.Active })
   status: EStatus;

   @AppProp({ type: Boolean, default: false })
   stackable: boolean;

   @ValidateIf((o) => [EAllowance.SpendBase, EAllowance.TotalSpendBase].includes(o.type))
   @AppProp({ type: SchemaTypes.Mixed }, { type: Amount })
   spendTrigger?: Amount;

   @ValidateIf((o) => o.type === EAllowance.TierBased)
   @AppProp({ type: SchemaTypes.Mixed }, { type: TimeRange })
   timeTrigger?: TimeRange;

   @ValidateIf((o) => [EAllowance.StockLevel, EAllowance.VolumeLevel].includes(o.type))
   @AppProp({ type: Number })
   levelTrigger?: number;

   @ValidateIf((o) => o.type === EAllowance.Geographic)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Address' }] })
   addressTrigger?: AppSchema<Address>[];

   @ValidateIf((o) => o.type === EAllowance.PaymentMethod)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }] })
   paymentMethodTrigger?: AppSchema<Category>[];

   @ValidateIf((o) => o.type === EAllowance.Currency)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Currency' }] })
   currencyTrigger?: AppSchema<Unit>[];

   @ValidateIf((o) => o.type === EAllowance.StockLevel)
   @AppProp({ type: [SchemaTypes.Mixed] }, { type: ProductPurchased })
   bundleTrigger?: ProductPurchased[];

   @ValidateIf((o) => o.type === EAllowance.Bundle)
   @AppProp({ type: Boolean })
   levelLowerTrigger?: boolean;

   @AppProp({ type: Date, required: false })
   expireAt?: Date;

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Campaign' })
   campaign: AppSchema<Campaign>;
}
