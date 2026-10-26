import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Complaint, ComplaintDocument } from './schemas/complaint.schema';
import { Device, DeviceDocument } from '../devices/schemas/device.schema';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

const POPULATE_OPTS = [
  { path: 'userId', select: 'name email' },
  { path: 'tankId', select: 'tankName location' },
  { path: 'deviceMongoId', select: 'deviceId deviceName' },
];

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(userId: string, dto: CreateComplaintDto): Promise<ComplaintDocument> {
    const complaint = new this.complaintModel({
      userId: new Types.ObjectId(userId),
      tankId: dto.tankId ? new Types.ObjectId(dto.tankId) : null,
      deviceMongoId: dto.deviceMongoId ? new Types.ObjectId(dto.deviceMongoId) : null,
      subject: dto.subject,
      description: dto.description,
    });
    return complaint.save();
  }

  findAll(limit = 50, skip = 0): Promise<ComplaintDocument[]> {
    const safeLimit = Math.min(limit, 200);
    return this.complaintModel
      .find()
      .populate(POPULATE_OPTS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .exec();
  }

  async findForAdmin(adminId: string): Promise<ComplaintDocument[]> {
    const adminObjectId = new Types.ObjectId(adminId);
    const devices = await this.deviceModel
      .find({ assignedAdminIds: adminObjectId })
      .select('_id tankId')
      .exec();

    const deviceIds = devices.map(d => d._id);
    const tankIds = devices.map(d => d.tankId).filter(Boolean);

    return this.complaintModel
      .find({
        $or: [
          { deviceMongoId: { $in: deviceIds } },
          { tankId: { $in: tankIds } },
        ],
      })
      .populate(POPULATE_OPTS)
      .sort({ createdAt: -1 })
      .exec();
  }

  findByUser(userId: string): Promise<ComplaintDocument[]> {
    return this.complaintModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate(POPULATE_OPTS)
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, dto: UpdateComplaintDto, requestingUser: { _id: any; role: string }): Promise<ComplaintDocument> {
    const complaint = await this.complaintModel.findById(id).exec();
    if (!complaint) throw new NotFoundException('Complaint not found');

    if (requestingUser.role === 'admin') {
      const adminObjectId = new Types.ObjectId(String(requestingUser._id));
      const device = await this.deviceModel.findOne({
        assignedAdminIds: adminObjectId,
        $or: [
          { _id: complaint.deviceMongoId },
          { tankId: complaint.tankId },
        ],
      }).exec();
      if (!device) throw new ForbiddenException('Not assigned to this complaint');
    }

    complaint.status = dto.status;
    return complaint.save();
  }
}
