import { SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Type } from 'class-transformer';
import { AppProp } from '@app/decorator';
import { MetadataValue } from '@app/dto';
import { BaseSchema, Category } from '@app/schema';

export class Option extends BaseSchema {
  @AppProp({ type: String })
  name: string;

  @AppProp({ type: SchemaTypes.ObjectId, ref: 'Category' })
  category: Category;

  @AppProp({ type: SchemaTypes.Mixed })
  @Type(() => MetadataValue)
  metadata: MetadataValue;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
