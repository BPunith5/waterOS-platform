import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  providers: [ComplaintsService],
  controllers: [ComplaintsController],
})
export class ComplaintsModule {}
