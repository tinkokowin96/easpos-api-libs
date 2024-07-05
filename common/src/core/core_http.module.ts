import {
  REDIS_CLIENT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  TRT_TRS_HVY_F,
  TRT_TRS_HVY_S,
  TRT_TRS_HVY_T,
} from '@common/constant';
import {
  InternalServerErrorException,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, hours, minutes } from '@nestjs/throttler';
import { AddressModule } from '@shared/address/address.module';
import { CategoryModule } from '@shared/category/category.module';
import { MailModule } from '@shared/mail/mail.module';
import * as cookieParser from 'cookie-parser';
import { Redis } from 'ioredis';
import { CoreModule } from './core.module';
import { ThrottlerStorageRedis } from './redis_throttler_storage.service';

@Module({
  imports: [
    CoreModule,
    ThrottlerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const client = await new Redis({
          host: config.get<string>(REDIS_HOST),
          port: config.get<number>(REDIS_PORT),
          password: config.get<string>(REDIS_PASSWORD),
        });
        return {
          throttlers: [
            {
              ttl: minutes(1),
              limit: config.get(TRT_TRS_HVY_F),
            },
            {
              ttl: minutes(30),
              limit: config.get(TRT_TRS_HVY_S),
            },
            {
              ttl: hours(3),
              limit: config.get(TRT_TRS_HVY_T),
            },
          ],
          storage: new ThrottlerStorageRedis(client),
        };
      },
      inject: [ConfigService],
    }),
    AddressModule,
    CategoryModule,
    MailModule,
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService) => {
        const client = await new Redis({
          host: config.get<string>(REDIS_HOST),
          port: config.get<number>(REDIS_PORT),
          password: config.get<string>(REDIS_PASSWORD),
        });
        client.on('error', (err) => {
          console.error('Redis Client Error');
          throw new InternalServerErrorException(err);
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
})
export class CoreHttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser.default()).forRoutes('*');
  }
}
