import { Type } from 'class-transformer';
import {
   IsBoolean,
   IsDateString,
   IsEmail,
   IsEnum,
   IsMongoId,
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   Matches,
   Max,
   Min,
   ValidateIf,
   ValidateNested,
} from 'class-validator';
import { EField, EMfa, EStatus, ETime, EUser, EUserApp } from '@common/utils/enum';
import { regex } from '@common/utils/regex';
import { TmpBlock } from '@shared/user/user.schema';
import { IsAppString } from '../validator';
import { WEEK_DAY } from '../constant';

export function $Period(
   reqPeriod?: Array<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'>,
) {
   class Period {
      @ValidateIf(() => reqPeriod && reqPeriod.includes('year'))
      @IsNumber()
      @Min(1900)
      @Max(2100)
      year?: number;

      @ValidateIf(() => reqPeriod && reqPeriod.includes('month'))
      @IsNumber()
      @Min(1)
      @Max(12)
      month?: number;

      @ValidateIf(() => reqPeriod && reqPeriod.includes('day'))
      @IsNumber()
      @Min(1)
      @Max(31)
      days?: number;

      @ValidateIf(() => reqPeriod && reqPeriod.includes('hour'))
      @IsNumber()
      @Min(0)
      @Max(23)
      hours?: number;

      @ValidateIf(() => reqPeriod && reqPeriod.includes('minute'))
      @IsNumber()
      @Min(0)
      @Max(59)
      minutes?: number;

      @ValidateIf(() => reqPeriod && reqPeriod.includes('second'))
      @IsNumber()
      @Min(0)
      @Max(59)
      seconds?: number;
   }

   return Period;
}

export class Period extends $Period() {}

export class TimePeriod extends $Period(['hour', 'minute']) {}

export class MonthlyPeriod extends $Period(['year', 'month']) {}

export class MFA {
   @IsAppString('number')
   code: string;

   @IsDateString()
   expireAt: Date;

   @IsEnum(EMfa)
   type: EMfa;
}

export class UserProfile {
   @IsMongoId()
   id: string;

   @IsEnum(EUser)
   type: EUser;

   @IsString()
   name?: string;

   @IsEmail()
   mail?: string;

   @Matches(regex.userName)
   userName?: string;
}

export class AuthUser {
   @IsMongoId()
   id: string;

   @IsString()
   userName: string;

   @IsString()
   firstName: string;

   @IsString()
   lastName: string;

   @IsEmail()
   mail: string;

   @IsEnum(EStatus)
   status: EStatus;

   @IsBoolean()
   isOwner: boolean;

   @IsEnum(EUser)
   type: EUser;

   @IsEnum(EUserApp)
   app: EUserApp;

   @IsOptional()
   @ValidateNested()
   @Type(() => TmpBlock)
   tmpBlock: TmpBlock;

   permissions: Record<string, number>;
}

export class UserRole {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsOptional()
   @IsMongoId({ each: true })
   permissions: string[];
}

export class AppliedAllowance {}

export class Payment {
   @IsNumber()
   price: number;

   @IsOptional()
   @IsMongoId()
   allowance?: string;

   @IsOptional()
   @IsMongoId()
   paymentMethod?: string;

   @IsNumber()
   netPrice: number;
}

export class TimeRange {
   @IsEnum(ETime)
   type: ETime;

   //NOTE: manual validate wrt type
   @IsNumber()
   from: number;

   //NOTE: manual validate wrt type
   @IsNumber()
   to: number;
}

export class ProductPurchased {
   @IsString() //NOTE:qr-code
   product: string;

   @IsNumber()
   quantity: number;
}

export class Amount {
   @IsNumber()
   amount: number;

   @IsOptional()
   @IsMongoId()
   unitId?: string; //NOTE: can also be currency
}

export class TimedCredit {
   @IsDateString()
   expireAt: string;

   @IsNumber()
   amount: number;
}

export class Field {
   @IsString() //NOTE: use this field to meta value
   @Matches(regex.fieldName)
   name: string;

   @IsEnum(EField)
   type: EField;

   @IsBoolean()
   isOptional: boolean;

   @IsBoolean()
   isArray: boolean;

   @IsOptional()
   @IsNumber()
   priority: number; //NOTE: might use this field to dynamic render custom fields on UI

   @IsOptional()
   @IsString()
   remark?: string;
}

export class FieldValue {
   @IsString()
   @Matches(regex.fieldName)
   name: string;

   @IsNotEmpty()
   value: any;
}

export class Subscription {
   @IsDateString()
   subActiveDate: string;

   @IsEnum(EStatus)
   status: EStatus;

   @IsDateString()
   expireAt: string;

   @IsBoolean()
   sentExpiredMail: boolean;

   @IsBoolean()
   sentPreExpiredMail: boolean;
}

export class MonthlyOperatingSchedule {
   @ValidateNested()
   @Type(() => MonthlyPeriod)
   month: MonthlyPeriod;

   @IsNumber(undefined, { each: true })
   @Min(1, { each: true })
   @Max(31, { each: true })
   days: number[];
}

export class OperatingSchedule {
   @IsOptional()
   @IsAppString('include', { arr: WEEK_DAY }, { each: true })
   weeklyClosedDay?: WeekDay[];

   @IsOptional()
   @IsNumber(undefined, { each: true })
   @Min(0, { each: true })
   @Max(100, { each: true })
   monthlyClosedDay?: number[];

   @IsOptional()
   @ValidateNested({ each: true })
   @Type(() => MonthlyOperatingSchedule)
   exceptionOpenDays?: MonthlyOperatingSchedule[];

   @IsOptional()
   @ValidateNested()
   @Type(() => TimePeriod)
   openingTime?: TimePeriod;

   @IsOptional()
   @ValidateNested()
   @Type(() => TimePeriod)
   closingTime?: TimePeriod;
}

export class Dimension {
   @ValidateNested()
   @Type(() => Amount)
   x: Amount;

   @ValidateNested()
   @Type(() => Amount)
   y: Amount;

   @ValidateNested()
   @Type(() => Amount)
   z: Amount;
}
