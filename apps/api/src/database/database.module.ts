import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { ServiceProvider } from '../sp/entities/service-provider.entity';
import { AuthCode } from '../auth/entities/auth-code.entity';
import { AuthSession } from '../auth/entities/auth-session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') || 'localhost',
        port: configService.get<number>('POSTGRES_PORT') || 5432,
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Role, ServiceProvider, AuthCode, AuthSession],
        synchronize: true, // Only for development! Allows auto-table creation
      }),
    }),
  ],
})
export class DatabaseModule { }
