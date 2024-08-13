import { AuthCredential } from '@common/schema/auth_credential.schema';
import { IsIP, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class GetAuthCredentialDto {
   @IsNotEmpty()
   @IsUrl()
   url: string;

   @IsOptional()
   @IsIP()
   ip?: string;
}

export type AuthCredentialReturn = { data: AuthCredential };

export interface AuthCredentialServiceMethods {
   getAuthCredential(dto: GetAuthCredentialDto, meta: Metadata): Promise<AuthCredentialReturn>;
}
