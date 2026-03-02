import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpService } from './sp.service';
import { ServiceProvider } from './entities/service-provider.entity';
import { IpAllowlistGuard } from './guards/ip-allowlist.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProvider])],
  providers: [SpService, IpAllowlistGuard],
  exports: [SpService, IpAllowlistGuard],
})
export class SpModule {}
