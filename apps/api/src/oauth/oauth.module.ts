import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { SpModule } from '../sp/sp.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SpModule,
    JwtModule.register({}),
  ],
  providers: [OauthService],
  controllers: [OauthController]
})
export class OauthModule { }
