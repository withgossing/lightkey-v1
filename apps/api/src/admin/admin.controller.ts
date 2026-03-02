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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

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
}
