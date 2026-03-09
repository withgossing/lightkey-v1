import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { SpModule } from '../sp/sp.module';

@Module({
  imports: [UsersModule, SpModule],
  controllers: [AdminController],
})
export class AdminModule { }
