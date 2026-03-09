import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Req() req: Request) {
        const user = req.user as User;
        return {
            id: user.id,
            employeeId: user.employeeId,
            email: user.email,
            roles: user.roles?.map((r) => r.name) || [],
            lastLoginAt: user.lastLoginAt,
        };
    }
}
