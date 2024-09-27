import { SchemaTypes } from 'mongoose';
import { Status } from '@common/dto/entity.dto';
import { EExpenseScope, EStatus } from '@common/utils/enum';
import { ValidateIf } from 'class-validator';
import BaseSchema from '@common/core/base.schema';
import AppProp from '@common/decorator/app_prop.decorator';
import Category from '../category/category.schema';
import Product from '../product/product.schema';

export default class Expense extends BaseSchema {
   @AppProp({ type: String, required: false })
   voucherId?: string;

   @AppProp({ type: SchemaTypes.ObjectId, ref: 'Category' })
   type: Category;

   @AppProp({ type: Number })
   amount: number;

   @AppProp({ type: Number }) //Inclusive
   taxAmount?: number;

   @AppProp({ type: Boolean })
   isTax: boolean;

   @AppProp(
      { type: SchemaTypes.Mixed, immutable: false, default: { status: EStatus.Pending } },
      { type: Status },
   )
   status: Status;

   @AppProp({ type: String, required: false })
   remark?: string;

   @AppProp({ type: [String] })
   attachments?: string[];

   @AppProp({ type: String, enum: EExpenseScope })
   scope: EExpenseScope;

   @ValidateIf((o) => o.scope === EExpenseScope.ProductCategory)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }] })
   eftProdCategories: AppSchema<Category>[];

   @ValidateIf((o) => o.scope === EExpenseScope.ProductTag)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }] })
   eftProdTags: AppSchema<Category>[];

   @ValidateIf((o) => o.scope === EExpenseScope.WholeProduct)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }] })
   eftWhlProds: AppSchema<Product>[];

   @ValidateIf((o) => o.scope === EExpenseScope.WholeProduct)
   @AppProp({ type: [{ type: SchemaTypes.ObjectId, ref: 'Product' }] })
   eftPerUntProds: AppSchema<Product>[];
}
