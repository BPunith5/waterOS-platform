import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TanksModule } from './tanks/tanks.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AlertsModule } from './alerts/alerts.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SimulationModule } from './simulation/simulation.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        if (process.env.MONGO_URI) {
          return { uri: process.env.MONGO_URI };
        }
        // Dev-only fallback: lazily require so this devDependency doesn't
        // need to be present in production builds where MONGO_URI is set.
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        return { uri: mongod.getUri() };
      },
    }),
    UsersModule,
    AuthModule,
    TanksModule,
    DevicesModule,
    TelemetryModule,
    AlertsModule,
    RealtimeModule,
    SimulationModule,
    AnalyticsModule,
    BootstrapModule,
    SuperAdminModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
