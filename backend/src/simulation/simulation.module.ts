import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { Telemetry, TelemetrySchema } from '../telemetry/schemas/telemetry.schema';
import { Tank, TankSchema } from '../tanks/schemas/tank.schema';
import { AlertsModule } from '../alerts/alerts.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { SimulationService } from './simulation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: Telemetry.name, schema: TelemetrySchema },
      { name: Tank.name, schema: TankSchema },
    ]),
    AlertsModule,
    RealtimeModule,
  ],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
