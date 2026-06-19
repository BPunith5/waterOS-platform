import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  generateDeviceId,
  generateActivationPin,
  generateSecretKey,
  generateRegistrationCode,
  generateRegistrationQrCode,
} from '../devices/device.utils';
import { Device, DeviceDocument } from '../devices/schemas/device.schema';
import { Telemetry, TelemetryDocument } from '../telemetry/schemas/telemetry.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BatchProvisionDto } from './dto/batch-provision.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
  ) {}

  async createAdmin(dto: CreateAdminDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) throw new ConflictException('Email already registered');
    return this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: dto.password,
      role: 'admin',
    });
  }

  listAdmins(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'admin' }).sort({ createdAt: -1 }).exec();
  }

  async deactivateAdmin(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Admin not found');
  }

  async provisionDevice(superAdminId: Types.ObjectId, dto: ProvisionDeviceDto): Promise<DeviceDocument> {
    const deviceId = generateDeviceId();
    const activationPin = generateActivationPin();
    const secretKey = generateSecretKey();
    const registrationCode = generateRegistrationCode();
    const qrCode = await generateRegistrationQrCode(registrationCode);

    const assignedAdminIds: Types.ObjectId[] = [];
    if (dto.adminId) {
      const admin = await this.userModel.findById(dto.adminId).exec();
      if (!admin || admin.role !== 'admin') throw new NotFoundException('Admin not found');
      assignedAdminIds.push(new Types.ObjectId(dto.adminId));
    }

    return this.deviceModel.create({
      deviceId,
      deviceName: dto.deviceName,
      userId: null,
      status: 'unclaimed',
      provisionSource: 'provisioned',
      activationPin,
      secretKey,
      qrCode,
      registrationCode,
      assignedAdminIds,
    });
  }

  async batchProvision(
    superAdminId: Types.ObjectId,
    dto: BatchProvisionDto,
  ): Promise<{ devices: DeviceDocument[]; csv: string }> {
    const adminObjectId = dto.adminId ? new Types.ObjectId(dto.adminId) : null;

    if (adminObjectId) {
      const admin = await this.userModel.findById(adminObjectId).exec();
      if (!admin || admin.role !== 'admin') throw new NotFoundException('Admin not found');
    }

    const devices: DeviceDocument[] = [];
    for (let i = 0; i < dto.count; i++) {
      const deviceId = generateDeviceId();
      const activationPin = generateActivationPin();
      const secretKey = generateSecretKey();
      const registrationCode = generateRegistrationCode();
      const qrCode = await generateRegistrationQrCode(registrationCode);

      const device = await this.deviceModel.create({
        deviceId,
        deviceName: `${dto.namePrefix} ${i + 1}`,
        userId: null,
        status: 'unclaimed',
        provisionSource: 'provisioned',
        activationPin,
        secretKey,
        qrCode,
        registrationCode,
        assignedAdminIds: adminObjectId ? [adminObjectId] : [],
      });
      devices.push(device);
    }

    const csvLines = ['deviceId,deviceName,registrationCode,secretKey'];
    for (const d of devices) {
      const secretKey = await this.deviceModel.findById(d._id).select('+secretKey').exec();
      csvLines.push(`${d.deviceId},${d.deviceName},${d.registrationCode},${secretKey?.secretKey ?? ''}`);
    }
    const csv = csvLines.join('\n');

    return { devices, csv };
  }

  listAllDevices(): Promise<DeviceDocument[]> {
    return this.deviceModel
      .find()
      .populate('claimedBy', 'name email')
      .populate('assignedAdminIds', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async assignDevice(deviceId: string, adminId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    const admin = await this.userModel.findById(adminId).exec();
    if (!admin || admin.role !== 'admin') throw new NotFoundException('Admin not found');

    const adminObjectId = new Types.ObjectId(adminId);
    const alreadyAssigned = device.assignedAdminIds.some((id) => id.equals(adminObjectId));
    if (!alreadyAssigned) {
      device.assignedAdminIds.push(adminObjectId);
      await device.save();
    }
    return device;
  }

  async unassignDevice(deviceId: string, adminId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');

    const adminObjectId = new Types.ObjectId(adminId);
    device.assignedAdminIds = device.assignedAdminIds.filter((id) => !id.equals(adminObjectId));
    await device.save();
    return device;
  }

  listAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'user' }).sort({ createdAt: -1 }).exec();
  }

  getTelemetryAuditLog(limit = 100): Promise<TelemetryDocument[]> {
    return this.telemetryModel
      .find({ source: 'manual' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('pushedBy', 'name email')
      .exec();
  }

  async rotateRegistrationCode(deviceId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (device.status !== 'unclaimed') {
      throw new ForbiddenException('Registration code can only be rotated for unclaimed devices');
    }

    device.registrationCode = generateRegistrationCode();
    device.qrCode = await generateRegistrationQrCode(device.registrationCode);
    await device.save();
    return device;
  }

  async rotateSecretKey(deviceId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');

    device.secretKey = generateSecretKey();
    await device.save();
    return device;
  }

  async decommissionDevice(deviceId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');

    device.status = 'decommissioned';
    await device.save();
    return device;
  }
}
