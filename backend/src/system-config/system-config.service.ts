import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemConfig, SystemConfigDocument } from './schemas/system-config.schema';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectModel(SystemConfig.name) private model: Model<SystemConfigDocument>,
  ) {}

  async getConfig(): Promise<{ telemetryProtocol: 'mqtt' | 'http' }> {
    const doc = await this.model.findOneAndUpdate(
      {},
      { $setOnInsert: { telemetryProtocol: 'mqtt' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return { telemetryProtocol: doc!.telemetryProtocol };
  }

  async setProtocol(protocol: 'mqtt' | 'http'): Promise<{ telemetryProtocol: 'mqtt' | 'http' }> {
    const doc = await this.model.findOneAndUpdate(
      {},
      { telemetryProtocol: protocol },
      { upsert: true, new: true },
    );
    return { telemetryProtocol: doc!.telemetryProtocol };
  }
}
