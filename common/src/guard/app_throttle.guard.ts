import { EXCEED_LIMIT } from '@app/constant';
import { getServiceToken, isPeriodExceed } from '@app/helper';
import { ExecutionContext, Inject } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { ExceedLimitService } from 'shared/shared/exceed_limit/exceed_limit.service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { Request } from 'express';

//NOTE: Provide after AuthGuard
export class AppThrottleGuard extends ThrottlerGuard {
  @Inject(getServiceToken(EXCEED_LIMIT))
  private readonly exceedLimitService: ExceedLimitService;

  async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    dayjs.extend(duration);
    dayjs.extend(isSameOrAfter);
    const request: Request = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(request);
    const key = this.generateKey(context, tracker, 'default');
    const { totalHits } = await this.storageService.increment(key, ttl);
    const isExceed = totalHits > limit;
    const blockMsg = `${request.user ? `${request.user.firstName} ${request.user.lastName}` : request.ip}`;

    const { data: exceedLimit } = isExceed
      ? await this.exceedLimitService.limitRequest({ request })
      : await this.exceedLimitService.getLimit({ request });

    if (exceedLimit) {
      if (exceedLimit.blocked && !exceedLimit.threshold.blockedUntil)
        throw new ThrottlerException(`${blockMsg} is blocked. Please contact support..`);
      const [isBlockActive, until] = exceedLimit
        ? isPeriodExceed(exceedLimit.threshold.blockedUntil, exceedLimit.createdAt)
        : undefined;

      if (isBlockActive)
        throw new ThrottlerException(
          `${blockMsg} is blocked until ${dayjs(until).format('dd MMM yyyy, hh:mm')}. Please requestuest after that unless you'll be blocked more severely.`,
        );
      else if (!isExceed) await this.exceedLimitService.unlimitRequest({ request });
    }
    return true;
  }

  protected throwException(message: string): void {
    throw new ThrottlerException(message);
  }
}
