import { User } from '@common/schema/user.schema';
import { regex } from '@common/utils/regex';
import { OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  ValidateNested,
} from 'class-validator';
import { AuthUser, CoreDto, FindByIdDto, FindDto } from './core.dto';
import { Type } from 'class-transformer';

export class GetUserDto extends FindDto {
  @IsMongoId()
  id?: string;

  @Matches(regex.userName)
  userName?: string;

  @IsEmail()
  mail?: string;
}

export class CreateUserDto extends OmitType(CoreDto(User), ['merchant', 'servicePermissions']) {
  @ValidateNested()
  @Type(() => AuthUser)
  authUser?: AuthUser;

  @IsMongoId()
  merchantId?: string;
}

export class UserWihAuthDto extends FindByIdDto {
  @IsUrl()
  url: string;
}

export type UserReturn = { data: User };

export interface UserServiceMethods {
  getUser(dto: GetUserDto): Promise<UserReturn>;
  userWithAuth(dto: FindByIdDto): Promise<{ data: AuthUser }>;
  createUser(dto: CreateUserDto): Promise<UserReturn>;
}
