import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async verifyClaimCode(dto: ClaimDeviceDto): Promise<{ valid: boolean }> {
    const deviceId = dto.registrationCode.replace(/-/g, '').toUpperCase();
    const device = await this.deviceModel.findOne({ deviceId }).exec();
    if (!device) throw new NotFoundException('Device not found — check your device ID');
    if (device.activationPin !== dto.activationPin) throw new ForbiddenException('Incorrect activation PIN — check the PIN on your device label');
    if (device.status === 'active') throw new ForbiddenException('This device is already registered to an account');
    if (device.status !== 'unclaimed') throw new ForbiddenException('This device is not available for registration');
    return { valid: true };
  }

  async claimDevice(userId: Types.ObjectId, dto: ClaimDeviceDto): Promise<DeviceDocument> {
    const deviceId = dto.registrationCode.replace(/-/g, '').toUpperCase();

    await this.tanksService.findOne(userId, dto.tankId);

    // Atomic findOneAndUpdate: only succeeds if the device is still unclaimed.
    // This eliminates the TOCTOU race where two concurrent requests both pass
    // the check-then-update pattern and double-claim the same device.
    const device = await this.deviceModel
      .findOneAndUpdate(
        { deviceId, activationPin: dto.activationPin, status: 'unclaimed' },
        {
          $set: {
            status: 'active',
            userId,
            tankId: new Types.ObjectId(dto.tankId),
            claimedBy: userId,
            claimedAt: new Date(),
            lastSeen: new Date(),
          },
        },
        { new: true },
      )
      .exec();

    if (!device) {
      throw new ConflictException('Device already claimed or invalid credentials');
    }

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
