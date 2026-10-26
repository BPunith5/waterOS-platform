import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tank, TankSchema } from './schemas/tank.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tank.name, schema: TankSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  providers: [TanksService],
  controllers: [TanksController],
  exports: [TanksService],
})
export class TanksModule {}
