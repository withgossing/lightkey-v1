"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const ioredis_1 = __importDefault(require("ioredis"));
const users_service_1 = require("../users/users.service");
const redis_module_1 = require("../redis/redis.module");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    configService;
    redisClient;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService, configService, redisClient) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisClient = redisClient;
    }
    async validateUser(employeeId, pass) {
        const user = await this.usersService.findByEmployeeId(employeeId);
        if (!user) {
            return null;
        }
        if (user.isLocked) {
            this.logger.warn(`Locked account attempted login: ${employeeId}`);
            throw new common_1.UnauthorizedException('Account is locked due to multiple failed login attempts.');
        }
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            return null;
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async login(user) {
        const payload = {
            sub: user.id,
            employeeId: user.employeeId,
            roles: user.roles.map((r) => r.name),
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: refreshExpiresIn,
        });
        await this.redisClient.set(`refresh_token:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);
        return {
            accessToken,
            refreshToken,
        };
    }
    async logout(userId) {
        await this.redisClient.del(`refresh_token:${userId}`);
        this.logger.log(`User logged out, refresh token evicted: ${userId}`);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        ioredis_1.default])
], AuthService);
//# sourceMappingURL=auth.service.js.map