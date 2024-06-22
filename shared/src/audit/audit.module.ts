import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { Audit, AuditSchema } from './audit.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { getRepositoryProvider } from '@common/utils/misc';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
  controllers: [AuditController],
  providers: [AuditService, getRepositoryProvider(Audit.name)],
  exports: [AuditService],
})
export class AuditModule {}
