import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
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

    // Store refresh token in PostgreSQL (Whitelist)
    // Expiration set to roughly 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // In a real app we might hash this, but we'll store literal for now 
    // to match previous simple string approach, or a hash to be more secure.
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Clear old session
    await this.authSessionRepository.delete({ userId: user.id });

    const session = this.authSessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.authSessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.authSessionRepository.delete({ userId });
    this.logger.log(`User logged out, refresh token evicted: ${userId}`);
  }
}
