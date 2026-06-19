import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TanksService } from '../tanks/tanks.service';
import { generateActivationPin, generateDeviceId, generateQrCode, generateSecretKey } from './device.utils';
import { ClaimDeviceDto } from './dto/claim-device.dto';
import { ConnectDeviceDto } from './dto/connect-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device, DeviceDocument } from './schemas/device.schema';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    private readonly tanksService: TanksService,
  ) {}

  async register(userId: Types.ObjectId, dto: CreateDeviceDto): Promise<DeviceDocument> {
    if (dto.tankId) {
      await this.tanksService.findOne(userId, dto.tankId);
    }

    const deviceId = generateDeviceId();
    const activationPin = generateActivationPin();
    const secretKey = generateSecretKey();
    const qrCode = await generateQrCode(deviceId, activationPin);

    return this.deviceModel.create({
      deviceId,
      deviceName: dto.deviceName,
      userId,
      tankId: dto.tankId ? new Types.ObjectId(dto.tankId) : null,
      activationPin,
      secretKey,
      qrCode,
    });
  }

  findAllForUser(userId: Types.ObjectId): Promise<DeviceDocument[]> {
    return this.deviceModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(userId: Types.ObjectId, id: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(id).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (!device.userId || !device.userId.equals(userId)) throw new ForbiddenException('Not your device');
    return device;
  }

  async update(userId: Types.ObjectId, id: string, dto: UpdateDeviceDto): Promise<DeviceDocument> {
    const device = await this.findOne(userId, id);
    if (dto.tankId) {
      await this.tanksService.findOne(userId, dto.tankId);
      device.tankId = new Types.ObjectId(dto.tankId);
    }
    if (dto.deviceName) device.deviceName = dto.deviceName;
    return device.save();
  }

  async connectToTank(userId: Types.ObjectId, dto: ConnectDeviceDto): Promise<DeviceDocument> {
    const device = await this.deviceModel.findOne({ deviceId: dto.deviceId.toUpperCase() }).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (!device.userId || !device.userId.equals(userId)) throw new ForbiddenException('Not your device');
    if (device.activationPin !== dto.activationPin) throw new ForbiddenException('Invalid activation PIN');

    await this.tanksService.findOne(userId, dto.tankId);

    device.tankId = new Types.ObjectId(dto.tankId);
    device.status = 'active';
    device.lastSeen = new Date();
    await device.save();

    return device;
  }

  async claimDevice(userId: Types.ObjectId, dto: ClaimDeviceDto): Promise<DeviceDocument> {
    // Normalize registration code: strip dashes, uppercase
    const normalizedCode = dto.registrationCode.replace(/-/g, '').toUpperCase();
    const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}-${normalizedCode.slice(8, 12)}-${normalizedCode.slice(12, 16)}`;

    const device = await this.deviceModel.findOne({ registrationCode: formattedCode }).exec();
    if (!device) throw new NotFoundException('Device not found — check your registration code');
    if (device.status !== 'unclaimed') throw new ForbiddenException('Device is not available to claim');

    await this.tanksService.findOne(userId, dto.tankId);

    device.claimedBy = userId as unknown as Types.ObjectId;
    device.claimedAt = new Date();
    device.userId = userId as unknown as Types.ObjectId;
    device.tankId = new Types.ObjectId(dto.tankId);
    device.status = 'active';
    device.lastSeen = new Date();
    await device.save();

    return device;
  }

  async unclaimDevice(userId: Types.ObjectId, deviceId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    if (!device) throw new NotFoundException('Device not found');
    if (!device.claimedBy || !device.claimedBy.equals(userId)) throw new ForbiddenException('Not your device');

    device.status = 'unclaimed';
    device.claimedBy = null;
    device.claimedAt = null;
    device.tankId = null;
    device.userId = null;
    await device.save();

    return device;
  }
}
