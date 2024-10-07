import {
   IsBoolean,
   IsMongoId,
   IsNumber,
   IsOptional,
   Max,
   Min,
   ValidateIf,
   ValidateNested,
} from 'class-validator';
import { SchemaTypes } from 'mongoose';
import BaseSchema from '@common/core/base.schema';
import AppProp from '@common/decorator/app_prop.decorator';
import Category from '../category/category.schema';
import { EProduct, EProductStatus } from '@common/utils/enum';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { Field } from '@common/dto/entity.dto';

class BasePrice {
   @IsNumber()
   amount: number;

   @IsMongoId()
   currencyId: string;
}

class PriceVariant {
   @IsMongoId() //NOTE: tag
   id: string;

   @IsNumber({ maxDecimalPlaces: 2 })
   @Min(0.01)
   @Max(0.99)
   baseMultiplier: number;

   @ValidateIf((o) => !o.basePrice)
   @IsBoolean()
   foc?: boolean;
}

class ExtraSubCountPrice {
   @IsNumber()
   amount: number;

   @IsOptional()
   @ValidateNested()
   priceThreshold: Record<number, number>; //NOTE: 10$ -> 10more, 8$ -> 100more etc.,
}

class ExtraSubCountPriceVariant extends OmitType(PriceVariant, ['foc']) {}

class SubscriptionAllowance {
   @IsNumber()
   baseCount: number;

   @IsBoolean()
   canExtendExtraCount: boolean;

   @IsOptional()
   @ValidateNested()
   @Type(() => ExtraSubCountPrice)
   extraCountPrice?: ExtraSubCountPrice;

   @ValidateIf((o) => o.canExtendExtraCount)
   @ValidateNested({ each: true })
   @Type(() => ExtraSubCountPriceVariant)
   extraTierPrices?: ExtraSubCountPriceVariant[];

   @ValidateIf((o) => o.canExtendExtraCount)
   @ValidateNested({ each: true })
   @Type(() => ExtraSubCountPriceVariant)
   extraTagPrices?: ExtraSubCountPriceVariant[];
}

export class BaseProduct extends BaseSchema {
   @AppProp({ type: String })
   name: string;

   @AppProp({ type: String, required: false })
   description?: string;

   @AppProp({ type: [String], required: false })
   attachments?: string[];

   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }], required: false })
   tags?: AppSchema<Category>[];
}

@Schema()
export default class Product extends BaseProduct {
   @AppProp({ type: String, unique: true })
   qrCode: string;

   @AppProp({ type: String, enum: EProduct })
   type: EProduct;

   @AppProp({ type: [String], enum: EProductStatus })
   statuses: EProductStatus[];

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Category' })
   category: AppSchema<Category>;

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Category', required: false })
   unit?: AppSchema<Category>;

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Category' })
   subType: AppSchema<Category>;

   @AppProp({ type: SchemaTypes.Mixed }, { type: BasePrice })
   basePrice: BasePrice;

   @AppProp({ type: [SchemaTypes.Mixed], required: false }, { type: PriceVariant })
   tagPrices?: PriceVariant[];

   @ValidateIf((o) => o.type === EProduct.Subscription)
   @AppProp({ type: SchemaTypes.Mixed }, { type: SubscriptionAllowance })
   subAllowance?: SubscriptionAllowance;

   @AppProp({ type: [SchemaTypes.Mixed], required: false }, { type: Field })
   meta?: Field[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
