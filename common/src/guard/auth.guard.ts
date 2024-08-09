import { MERCHANT, USERS } from '@common/constant';
import { ContextService } from '@common/core/context/context.service';
import { AllowedUser } from '@common/dto/core.dto';
import { EAllowedUser, EApp, EUser } from '@common/utils/enum';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_MERCHANT } from '@common/constant/app_context.constant';
import { AppRedisService } from '@common/core/app_redis/app_redis.service';
import { AppBrokerService } from '@common/core/app_broker/app_broker.service';
import { getServiceToken } from '@common/utils/misc';
import { parsePath } from '@common/utils/regex';

/*
TODO,NOTE cache authorized status up to 1 day which mean user may able to
authorized 1 day max even if subscription is expired..
*/
@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private readonly dbService: AppRedisService,
      private readonly reflector: Reflector,
      private readonly context: ContextService,
      private readonly appBroker: AppBrokerService,
      @Inject(getServiceToken(MERCHANT)) private readonly merchantService,
   ) {}

   async canActivate(context: ExecutionContext) {
      const allowedUsers = this.reflector.get<AllowedUser[]>(USERS, context.getHandler());
      const user = this.context.get('user');
      const request = context.switchToHttp().getRequest();
      const [_, service]: any = parsePath(request.originalUrl);

      if (allowedUsers.length) {
         if (user) {
            if (
               !user.isOwner &&
               (!user.permissions.hasOwnProperty(service) ||
                  !user.permissions[service].includes(request.originalUrl))
            )
               return false;

            if (EUser.Admin && allowedUsers.includes(EUser.Admin)) return true;

            let authMerchant = await this.dbService.get<AppMerchant>(APP_MERCHANT, 'json');
            if (!authMerchant) {
               authMerchant = await this.appBroker.request(
                  (meta) => this.merchantService.merchantWithAuth({ id: user.id }, meta),
                  true,
                  EApp.Admin,
               );
            }
            if (!authMerchant.merchant) return false;

            return authMerchant.isSubActive || allowedUsers.includes(EAllowedUser.MerchantNoSub);
         }
         return false;
      }

      return true;
   }
}
