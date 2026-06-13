import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TanksModule } from '../tanks/tanks.module';
import { SimulationModule } from '../simulation/simulation.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device, DeviceSchema } from './schemas/device.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]), TanksModule, SimulationModule],
  providers: [DevicesService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
