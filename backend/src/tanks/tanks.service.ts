import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tank, TankDocument } from './schemas/tank.schema';
import { CreateTankDto } from './dto/create-tank.dto';
import { UpdateTankDto } from './dto/update-tank.dto';

@Injectable()
export class TanksService {
  constructor(@InjectModel(Tank.name) private readonly tankModel: Model<Tank>) {}

  create(userId: Types.ObjectId, dto: CreateTankDto): Promise<TankDocument> {
    return this.tankModel.create({ ...dto, userId });
  }

  findAllForUser(userId: Types.ObjectId): Promise<TankDocument[]> {
    return this.tankModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(userId: Types.ObjectId, id: string): Promise<TankDocument> {
    const tank = await this.tankModel.findById(id).exec();
    if (!tank) throw new NotFoundException('Tank not found');
    if (!tank.userId.equals(userId)) throw new ForbiddenException('Not your tank');
    return tank;
  }

  async update(userId: Types.ObjectId, id: string, dto: UpdateTankDto): Promise<TankDocument> {
    const tank = await this.findOne(userId, id);
    Object.assign(tank, dto);
    return tank.save();
  }

  async remove(userId: Types.ObjectId, id: string): Promise<void> {
    const tank = await this.findOne(userId, id);
    await tank.deleteOne();
  }
}
