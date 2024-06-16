import { AppProp } from '@app/decorator';
import { User } from '@app/dto';
import { parseUA } from '@app/helper';
import { BaseSchema } from '@app/schema';
import { SchemaFactory } from '@nestjs/mongoose';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIP, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { IResult } from 'ua-parser-js';

export class RequestLog {
  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()
  @IsString()
  auxillaryService: string;

  @AppProp({ type: String })
  method: string;

  @AppProp({ type: SchemaTypes.Mixed, required: false })
  payload?: any;

  @AppProp({ type: SchemaTypes.Mixed, required: false })
  response?: any;
}

export class Audit extends BaseSchema {
  @AppProp({ type: SchemaTypes.Mixed })
  @Type(() => RequestLog)
  log: RequestLog;

  @AppProp({ type: SchemaTypes.Mixed })
  @ValidateNested({ each: true })
  @Type(() => RequestLog)
  logTrail?: RequestLog[];

  @AppProp({ type: String }, { swagger: { example: '102.205.88.126' } })
  @IsIP()
  submittedIP: string;

  @AppProp({ type: String })
  sessionId: string;

  @AppProp({ type: SchemaTypes.Mixed, set: (ua: string) => parseUA(ua) })
  userAgent: IResult;

  @AppProp({ type: SchemaTypes.Mixed, required: false })
  @Type(() => User)
  user?: User;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
