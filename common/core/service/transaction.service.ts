import { InjectConnection } from '@nestjs/mongoose';
import { AuditService } from '@common/service/audit.service';
import { Connection } from 'mongoose';
import { ContextService } from '@common/core/context.service';

export class TransactionService {
   constructor(
      @InjectConnection() private readonly connection: Connection,
      private readonly context: ContextService,
      private readonly auditService: AuditService,
   ) {}

   async makeTransaction(action: () => Promise<any>) {
      const session = await this.connection.startSession();
      try {
         session.startTransaction();
         this.context.set({ session: session });
         const res = await action();
         // this.auditService.logRequest();
         await session.commitTransaction();
         session.endSession();
         return res;
      } catch (error) {
         session.abortTransaction();
         session.endSession();
         throw new Error(error);
      }
   }
}