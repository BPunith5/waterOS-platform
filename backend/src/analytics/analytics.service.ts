import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device } from '../devices/schemas/device.schema';
import { Tank } from '../tanks/schemas/tank.schema';
import { Telemetry } from '../telemetry/schemas/telemetry.schema';
import { ANALYTICS_RANGES, AnalyticsRange } from './dto/analytics-query.dto';

const RANGE_DAYS: Record<AnalyticsRange, number> = { '7D': 7, '30D': 30, '90D': 90 };

function qualityScore(dissolvedOxygen: number, turbidity: number, ph: number): number {
  return (dissolvedOxygen + Math.max(0, 1 - turbidity / 10) + Math.max(0, 1 - Math.abs(ph - 7) / 3.5)) / 3;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Tank.name) private readonly tankModel: Model<Tank>,
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<Telemetry>,
  ) {}

  async getAnalytics(userId: Types.ObjectId, range: AnalyticsRange, tankId?: string) {
    const days = RANGE_DAYS[ANALYTICS_RANGES.includes(range) ? range : '7D'];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const tanks = await this.tankModel.find({ userId }).exec();
    const tankIds = tankId
      ? tanks.filter((t) => t._id.equals(tankId)).map((t) => t._id)
      : tanks.map((t) => t._id);

    const devices = await this.deviceModel
      .find({ userId, ...(tankId ? { tankId: new Types.ObjectId(tankId) } : {}) })
      .exec();

    const series = await this.telemetryModel
      .aggregate<{
        _id: string;
        waterLevel: number;
        dissolvedOxygen: number;
        ph: number;
        turbidity: number;
        temperature: number;
        battery: number;
        signal: number;
      }>([
        { $match: { tankId: { $in: tankIds }, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            waterLevel: { $avg: '$waterLevel' },
            dissolvedOxygen: { $avg: '$dissolvedOxygen' },
            ph: { $avg: '$ph' },
            turbidity: { $avg: '$turbidity' },
            temperature: { $avg: '$temperature' },
            battery: { $avg: '$battery' },
            signal: { $avg: '$signal' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    const [summaryAgg] = await this.telemetryModel
      .aggregate<{
        avgWaterLevel: number;
        avgDissolvedOxygen: number;
        avgPh: number;
        avgTurbidity: number;
        avgTemperature: number;
        count: number;
      }>([
        { $match: { tankId: { $in: tankIds }, timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            avgWaterLevel: { $avg: '$waterLevel' },
            avgDissolvedOxygen: { $avg: '$dissolvedOxygen' },
            avgPh: { $avg: '$ph' },
            avgTurbidity: { $avg: '$turbidity' },
            avgTemperature: { $avg: '$temperature' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const activeDevices = devices.filter((d) => d.status === 'active').length;

    const relevantTanks = tankId ? tanks.filter((t) => t._id.equals(tankId)) : tanks;
    const distributionMap = new Map<string, number>();
    for (const tank of relevantTanks) {
      distributionMap.set(tank.tankType, (distributionMap.get(tank.tankType) ?? 0) + 1);
    }

    return {
      range,
      series: series.map((s) => ({
        date: s._id,
        waterLevel: s.waterLevel,
        dissolvedOxygen: s.dissolvedOxygen,
        ph: s.ph,
        turbidity: s.turbidity,
        temperature: s.temperature,
        battery: s.battery,
        signal: s.signal,
        quality: qualityScore(s.dissolvedOxygen, s.turbidity, s.ph),
      })),
      summary: {
        avgWaterLevel: summaryAgg?.avgWaterLevel ?? null,
        avgQuality: summaryAgg ? qualityScore(summaryAgg.avgDissolvedOxygen, summaryAgg.avgTurbidity, summaryAgg.avgPh) : null,
        avgTemperature: summaryAgg?.avgTemperature ?? null,
        avgPh: summaryAgg?.avgPh ?? null,
        deviceUptimePercent: devices.length ? (activeDevices / devices.length) * 100 : 0,
        sampleCount: summaryAgg?.count ?? 0,
      },
      distribution: Array.from(distributionMap.entries()).map(([type, count]) => ({ type, count })),
    };
  }
}
