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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const jwt_1 = require("@nestjs/jwt");
const sp_service_1 = require("../sp/sp.service");
const uuid_1 = require("uuid");
const redis_module_1 = require("../redis/redis.module");
let OauthService = class OauthService {
    redis;
    spService;
    jwtService;
    constructor(redis, spService, jwtService) {
        this.redis = redis;
        this.spService = spService;
        this.jwtService = jwtService;
    }
    async generateAuthorizationCode(userId, clientId, redirectUri) {
        const sp = await this.spService.findByClientId(clientId);
        if (!sp) {
            throw new common_1.NotFoundException('Invalid client_id');
        }
        const code = (0, uuid_1.v4)();
        const payload = JSON.stringify({ userId, clientId, redirectUri });
        await this.redis.set(`auth_code:${code}`, payload, 'EX', 300);
        return code;
    }
    async exchangeCodeForToken(clientId, clientSecret, code, redirectUri) {
        const sp = await this.spService.validateClientCredentials(clientId, clientSecret);
        if (!sp) {
            throw new common_1.UnauthorizedException('Invalid client credentials');
        }
        const redisKey = `auth_code:${code}`;
        const payloadStr = await this.redis.get(redisKey);
        if (!payloadStr) {
            throw new common_1.UnauthorizedException('Invalid or expired authorization code');
        }
        await this.redis.del(redisKey);
        const payload = JSON.parse(payloadStr);
        if (payload.clientId !== clientId || payload.redirectUri !== redirectUri) {
            throw new common_1.UnauthorizedException('Authorization code context does not match');
        }
        const accessToken = this.jwtService.sign({ sub: payload.userId, sp: clientId }, { expiresIn: '1h' });
        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
        };
    }
};
exports.OauthService = OauthService;
exports.OauthService = OauthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default,
        sp_service_1.SpService,
        jwt_1.JwtService])
], OauthService);
//# sourceMappingURL=oauth.service.js.map