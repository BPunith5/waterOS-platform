import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async onModuleInit() {
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;
    if (!email || !password) {
      this.logger.warn('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set — skipping bootstrap');
      return;
    }

    const existing = (await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec()) as UserDocument | null;

    if (existing) {
      // Self-healing: fix any double-hashed password from earlier deployments
      const ok = await bcrypt.compare(password, existing.password ?? '');
      if (!ok) {
        const hashed = await bcrypt.hash(password, 12);
        await this.userModel.updateOne({ _id: existing._id }, { $set: { password: hashed, role: 'superadmin' } }).exec();
        this.logger.log(`Super admin password corrected: ${email}`);
      }
      return;
    }

    // create() triggers pre('save') hook which hashes the password — don't pre-hash here
    await this.userModel.create({ name: 'Super Admin', email: email.toLowerCase(), password, role: 'superadmin' });
    this.logger.log(`Super admin created: ${email}`);
  }
}
