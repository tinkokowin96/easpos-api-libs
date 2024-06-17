import { AppProp } from '@common/decorator';
import { EAuthCredential } from '@common/utils';
import { BaseSchema } from '@common/schema';
import { SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';

export class AuthCredential extends BaseSchema {
  @AppProp({ type: String, enum: EAuthCredential })
  type: EAuthCredential;

  @AppProp({ type: String }, { userName: true })
  userName: string;

  @AppProp({ type: String, set: async (pas) => await hash(pas, 16) })
  password: string;
}

export const AuthCredentialSchema =
  SchemaFactory.createForClass(AuthCredential);
