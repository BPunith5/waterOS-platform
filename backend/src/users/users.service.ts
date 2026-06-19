import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  create(data: { name: string; email: string; password: string; role?: string }): Promise<UserDocument> {
    return this.userModel.create({ ...data, email: data.email.toLowerCase() });
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'user' }).sort({ createdAt: -1 }).exec();
  }

  findAllAdmins(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'admin' }).sort({ createdAt: -1 }).exec();
  }

  async createAdmin(data: { name: string; email: string; password: string }): Promise<UserDocument> {
    return this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: 'admin',
    });
  }

  async deactivateAdmin(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Admin not found');
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const hashed = await bcrypt.hash(password, 12);
    const result = await this.userModel.findByIdAndUpdate(id, { password: hashed }).exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
