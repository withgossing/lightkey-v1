"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const users_service_1 = require("../users/users.service");
const sp_service_1 = require("../sp/sp.service");
const common_2 = require("@nestjs/common");
let AdminController = class AdminController {
    usersService;
    spService;
    constructor(usersService, spService) {
        this.usersService = usersService;
        this.spService = spService;
    }
    async registerUser(body) {
        const employeeId = body.employeeId;
        const email = body.email;
        const initialPassword = body.password;
        if (!employeeId || !initialPassword) {
            throw new common_1.UnauthorizedException('employeeId and password are required');
        }
        const user = await this.usersService.createManualUser(employeeId, email, initialPassword);
        return {
            message: 'User registered successfully by Admin',
            userId: user.id,
            employeeId: user.employeeId,
        };
    }
    async getAllSp() {
        const sps = await this.spService.findAll();
        return sps;
    }
    async createSp(body) {
        const result = await this.spService.create(body);
        return {
            message: 'Service Provider created successfully',
            sp: result.sp,
            rawSecret: result.rawSecret,
        };
    }
    async updateSp(id, body) {
        const sp = await this.spService.update(id, body);
        if (!sp) {
            throw new common_1.UnauthorizedException('SP not found');
        }
        return { message: 'Service Provider updated', sp };
    }
    async deleteSp(id) {
        const success = await this.spService.remove(id);
        if (!success) {
            throw new common_1.UnauthorizedException('SP not found or could not be deleted');
        }
        return { message: 'Service Provider deleted' };
    }
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
    async unlockUser(id) {
        const user = await this.usersService.unlockUser(id);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return { message: 'User unlocked successfully' };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('users/register'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "registerUser", null);
__decorate([
    (0, common_2.Get)('sp'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllSp", null);
__decorate([
    (0, common_1.Post)('sp'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSp", null);
__decorate([
    (0, common_2.Patch)('sp/:id'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __param(0, (0, common_2.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSp", null);
__decorate([
    (0, common_2.Delete)('sp/:id'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSp", null);
__decorate([
    (0, common_2.Get)('users'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users/:id/unlock'),
    (0, roles_decorator_1.Roles)('ROLE_ADMIN'),
    __param(0, (0, common_2.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unlockUser", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        sp_service_1.SpService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map