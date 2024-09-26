import { compareSync } from 'bcryptjs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { omit } from 'lodash';
import { request } from 'express';
import { responseError } from '@common/utils/misc';
import { EUser, EUserApp } from '@common/utils/enum';
import { encrypt } from '@common/utils/encrypt';
import User from './user.schema';
import CoreService from '@common/core/core.service';
import AppRedisService from '@common/core/app_redis/app_redis.service';
import ContextService from '@common/core/context';
import { LoginDto } from './user.dto';
import AppBrokerService from '@common/core/app_broker/app_broker.service';
import { MerchantServiceMethods } from '@common/dto/merchant.dto';

export abstract class UserService<T extends User = User> extends CoreService<T> {
   protected abstract readonly db: AppRedisService;
   protected abstract readonly appBroker: AppBrokerService;
   protected abstract readonly merchantService: MerchantServiceMethods;

   async logout() {
      const request = ContextService.get('request');
      const response = ContextService.get('response');
      await this.db.logout();
      request.session.destroy((err) => responseError(request, response, err));
   }

   async login({ email, userName, password, app }: LoginDto) {
      const { data: user }: any = await this.repository.findOne({
         filter: {
            email,
            userName,
         },
         options: { populate: ['role'] },
      });
      if (!user || !compareSync(password, user.password))
         throw new BadRequestException(`Incorrect ${email ? 'email' : 'userName'} or password`);
      const authUser: AuthUser = { ...(omit(user, ['mfa', 'password']) as any), app };
      const appForbiddenMsg = `Not Allowed to use ${app}`;
      switch (user.type) {
         case EUser.Admin:
            if (app !== EUserApp.SuperAdmin) throw new ForbiddenException(appForbiddenMsg);
            break;
         case EUser.Merchant:
            if (![EUserApp.Seller, EUserApp.Admin].includes(app))
               throw new ForbiddenException(appForbiddenMsg);
            break;
         case EUser.Partner:
            if (app !== EUserApp.Partner) throw new ForbiddenException(appForbiddenMsg);
            break;
         case EUser.Customer:
            if (app !== EUserApp.Customer) throw new ForbiddenException(appForbiddenMsg);
            break;
      }

      if (user.merchant)
         await this.appBroker.request<AppMerchant>({
            action: (meta) =>
               this.merchantService.loginUser(
                  {
                     id: user.merchant,
                     userId: user._id,
                     name: `${user.firstName} ${user.lastName}`,
                     app,
                  },
                  meta,
               ),
            cache: true,
            key: 'merchant',
         });
      if (user.role) {
         authUser.isOwner = user.role.isOwner;
         authUser.permissions = user.role.role?.permissions?.reduce((a, c) => {
            a[c] = 1;
            return a;
         }, {});
      }
      request.session.user = await encrypt(JSON.stringify(authUser));
   }
}
