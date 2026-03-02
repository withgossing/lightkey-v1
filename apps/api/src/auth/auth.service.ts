import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) { }

  async validateUser(employeeId: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmployeeId(employeeId);

    if (!user) {
      return null;
    }

    if (user.isLocked) {
      this.logger.warn(`Locked account attempted login: ${employeeId}`);
      throw new UnauthorizedException(
        'Account is locked due to multiple failed login attempts.',
      );
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);

    if (!isMatch) {
      // Logic to Increment failed logins would go here (or in controller to wrap this service)
      return null;
    }

    // Reset failed logins logic would go here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result as User;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      roles: user.roles.map((r) => r.name),
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiresIn,
    } as any);

    // Store refresh token in Redis (Whitelist)
    // Expiration set to roughly 7 days in seconds
    await this.redisClient.set(
      `refresh_token:${user.id}`,
      refreshToken,
      'EX',
      60 * 60 * 24 * 7,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.redisClient.del(`refresh_token:${userId}`);
    this.logger.log(`User logged out, refresh token evicted: ${userId}`);
  }
}
