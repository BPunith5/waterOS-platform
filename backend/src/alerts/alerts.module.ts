import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    RealtimeModule,
  ],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
