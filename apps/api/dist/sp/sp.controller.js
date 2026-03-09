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
var SpController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const sp_service_1 = require("./sp.service");
const ipaddr = __importStar(require("ipaddr.js"));
let SpController = SpController_1 = class SpController {
    spService;
    logger = new common_1.Logger(SpController_1.name);
    constructor(spService) {
        this.spService = spService;
    }
    async getAllProviders(req) {
        const user = req.user;
        const sps = await this.spService.findAll();
        const clientIpStr = req.ip || req.connection?.remoteAddress || '127.0.0.1';
        let clientIp = null;
        try {
            clientIp = ipaddr.process(clientIpStr);
        }
        catch {
        }
        const checkIp = (sp) => {
            if (!sp.allowedIps || sp.allowedIps.length === 0)
                return true;
            if (!clientIp)
                return false;
            return sp.allowedIps.some((allowedRange) => {
                try {
                    if (allowedRange.includes('/')) {
                        return clientIp.match(ipaddr.parseCIDR(allowedRange));
                    }
                    else {
                        return clientIp.toString() === ipaddr.process(allowedRange).toString();
                    }
                }
                catch {
                    return false;
                }
            });
        };
        return sps.map(sp => {
            let canAccess = true;
            let reason = null;
            const isIpAllowed = checkIp(sp);
            if (!isIpAllowed) {
                canAccess = false;
                reason = '접근 허용 IP 아님';
            }
            const roles = user.roles ? user.roles.map((r) => r.name) : [];
            if (sp.name.includes('관리자') && !roles.includes('ROLE_ADMIN')) {
                canAccess = false;
                reason = '관리자 권한 필요';
            }
            return {
                id: sp.id,
                clientId: sp.clientId,
                name: sp.name,
                description: sp.description,
                canAccess,
                reason
            };
        });
    }
};
exports.SpController = SpController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpController.prototype, "getAllProviders", null);
exports.SpController = SpController = SpController_1 = __decorate([
    (0, common_1.Controller)('sp'),
    __metadata("design:paramtypes", [sp_service_1.SpService])
], SpController);
//# sourceMappingURL=sp.controller.js.map