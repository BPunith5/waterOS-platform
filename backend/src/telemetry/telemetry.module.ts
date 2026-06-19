import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertsModule } from '../alerts/alerts.module';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { RealtimeModule } from '../realtime/realtime.module';
import { LogsController, TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { Telemetry, TelemetrySchema } from './schemas/telemetry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Telemetry.name, schema: TelemetrySchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    AlertsModule,
    RealtimeModule,
  ],
  providers: [TelemetryService],
  controllers: [TelemetryController, LogsController],
  exports: [TelemetryService],
})
export class TelemetryModule {}
