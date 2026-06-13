import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TanksModule } from './tanks/tanks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri =
          process.env.MONGO_URI ?? (await MongoMemoryServer.create()).getUri();
        return { uri };
      },
    }),
    UsersModule,
    AuthModule,
    TanksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
