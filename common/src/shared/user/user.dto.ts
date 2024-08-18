import { User } from '@common/schema/user.schema';
import { regex } from '@common/utils/regex';
import { OmitType } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsString, Matches, ValidateIf, ValidateNested } from 'class-validator';
import { CoreDto, FindDto } from '../../dto/core.dto';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '@shared/address/address.dto';

export class GetUserDto extends FindDto {
   @IsMongoId()
   id?: string;

   @Matches(regex.userName)
   userName?: string;

   @IsEmail()
   mail?: string;
}

export class LoginDto {
   @ValidateIf((o) => !!!o.userName)
   @IsEmail()
   email?: string;

   @ValidateIf((o) => !!!o.email)
   @Matches(regex.userName)
   userName?: string;

   @IsString()
   password: string;
}

export class CreateUserDto extends OmitType(CoreDto(User), ['status', 'tmpBlock', 'mfa']) {
   @ValidateNested()
   @Type(() => CreateAddressDto)
   addressDto: CreateAddressDto;
}