import { AppProp } from '@common/decorator/app_prop.decorator';
import { Status } from '@common/dto/entity.dto';
import { EStatus, ETmpBlock, EUser } from '@common/utils/enum';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { hashSync } from 'bcryptjs';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { BaseSchema } from './base.schema';
import { Merchant } from './merchant.schema';
import { Permission } from './permission.schema';
import { ServicePermission } from './service_permission.schema';

class TmpBlock {
  @IsDateString()
  until: Date;

  @IsEnum(ETmpBlock)
  type: ETmpBlock;

  @IsOptional()
  @IsString()
  remark?: string;
}

@Schema()
export class User extends BaseSchema {
  @AppProp({ type: String }, { userName: true })
  userName: string;

  @AppProp({ type: String, enum: EUser, default: EUser.Merchant, required: false })
  type: EUser;

  @AppProp({ type: SchemaTypes.Mixed, immutable: false, default: { status: EStatus.Pending } })
  @Type(() => Status)
  status?: Status;

  @AppProp({ type: SchemaTypes.Mixed, required: false })
  @Type(() => TmpBlock)
  tmpBlock?: TmpBlock;

  @AppProp({ type: String, required: false })
  @IsNumberString()
  mfa?: string;

  @AppProp({ type: String })
  firstName: string;

  @AppProp({ type: String })
  lastName: string;

  @AppProp({ type: String })
  @IsEmail()
  mail: string;

  @AppProp({
    type: String,
    set: (pas) => hashSync(pas, 16),
  })
  password: string;

  @AppProp({ type: SchemaTypes.Mixed, required: false })
  metadata?: any;

  @AppProp({ type: SchemaTypes.ObjectId, ref: 'Merchant', required: false })
  @ValidateIf((o) => [EUser.Admin, EUser.Customer].includes(o.type))
  @IsNotEmpty()
  merchant?: Merchant;

  @AppProp({
    type: [{ type: SchemaTypes.ObjectId, ref: 'ServicePermission' }],
    required: false,
  })
  servicePermissions?: ServicePermission[];
}

export const UserSchema = SchemaFactory.createForClass(User);
