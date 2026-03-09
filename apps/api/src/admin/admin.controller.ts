import {
  Controller,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { SpService } from '../sp/sp.service';
import { Get, Param, Patch, Delete } from '@nestjs/common';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly spService: SpService,
  ) { }

  @Post('users/register')
  @Roles('ROLE_ADMIN')
  async registerUser(@Body() body: Record<string, string>) {
    const employeeId = body.employeeId;
    const email = body.email;
    const initialPassword = body.password;

    if (!employeeId || !initialPassword) {
      throw new UnauthorizedException('employeeId and password are required');
    }

    // Rely on UsersService to create the user with default 'ROLE_USER'
    const user = await this.usersService.createManualUser(
      employeeId,
      email,
      initialPassword,
    );

    return {
      message: 'User registered successfully by Admin',
      userId: user.id,
      employeeId: user.employeeId,
    };
  }

  // --- Service Provider Management ---

  @Get('sp')
  @Roles('ROLE_ADMIN')
  async getAllSp() {
    const sps = await this.spService.findAll();
    return sps;
  }

  @Post('sp')
  @Roles('ROLE_ADMIN')
  async createSp(@Body() body: { name: string; description: string; allowedIps: string[] }) {
    const result = await this.spService.create(body);
    return {
      message: 'Service Provider created successfully',
      sp: result.sp,
      rawSecret: result.rawSecret, // Show exactly once
    };
  }

  @Patch('sp/:id')
  @Roles('ROLE_ADMIN')
  async updateSp(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; allowedIps?: string[] },
  ) {
    const sp = await this.spService.update(id, body);
    if (!sp) {
      throw new UnauthorizedException('SP not found'); // Should be NotFoundException but just for simplicity
    }
    return { message: 'Service Provider updated', sp };
  }

  @Delete('sp/:id')
  @Roles('ROLE_ADMIN')
  async deleteSp(@Param('id') id: string) {
    const success = await this.spService.remove(id);
    if (!success) {
      throw new UnauthorizedException('SP not found or could not be deleted');
    }
    return { message: 'Service Provider deleted' };
  }

  // --- Users Management ---

  @Get('users')
  @Roles('ROLE_ADMIN')
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return users.map(u => ({
      id: u.id,
      employeeId: u.employeeId,
      email: u.email,
      roles: u.roles?.map(r => r.name) || [],
      isLocked: u.isLocked,
      failedLoginAttempts: u.failedLoginAttempts,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));
  }

  @Post('users/:id/unlock')
  @Roles('ROLE_ADMIN')
  async unlockUser(@Param('id') id: string) {
    const user = await this.usersService.unlockUser(id);
    if (!user) throw new UnauthorizedException('User not found');
    return { message: 'User unlocked successfully' };
  }
}
