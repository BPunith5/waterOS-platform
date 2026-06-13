import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { AlertsService } from './alerts.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]), RealtimeModule],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
