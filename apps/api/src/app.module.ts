import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { AdminModule } from './admin/admin.module';
import { SpModule } from './sp/sp.module';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [
    DatabaseModule,
    SyncModule,
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    RedisModule,
    AdminModule,
    SpModule,
    OauthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
