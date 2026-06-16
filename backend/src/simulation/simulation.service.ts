import { Injectable } from '@nestjs/common';

@Injectable()
export class SimulationService {
  start(_deviceId: string): void {}
  stop(_deviceId: string): void {}
}
