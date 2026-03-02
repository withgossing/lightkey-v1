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
var IpAllowlistGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpAllowlistGuard = void 0;
const common_1 = require("@nestjs/common");
const ipaddr = __importStar(require("ipaddr.js"));
const sp_service_1 = require("../sp.service");
let IpAllowlistGuard = IpAllowlistGuard_1 = class IpAllowlistGuard {
    spService;
    logger = new common_1.Logger(IpAllowlistGuard_1.name);
    constructor(spService) {
        this.spService = spService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const clientIpStr = request.ip || request.connection.remoteAddress;
        const clientId = request.headers['x-client-id'] ||
            request.query['client_id'];
        if (!clientId) {
            this.logger.warn('IP Allowlist Check Failed: Missing client_id in request');
            throw new common_1.ForbiddenException('Missing Client ID for Service Provider validation');
        }
        if (!clientIpStr) {
            throw new common_1.ForbiddenException('Cannot determine client IP address');
        }
        try {
            const sp = await this.spService.findByClientId(clientId);
            if (!sp) {
                throw new common_1.ForbiddenException('Invalid Service Provider');
            }
            if (!sp.allowedIps || sp.allowedIps.length === 0) {
                return true;
            }
            const clientIp = ipaddr.process(clientIpStr);
            const isAllowed = sp.allowedIps.some((allowedRange) => {
                try {
                    if (allowedRange.includes('/')) {
                        const range = ipaddr.parseCIDR(allowedRange);
                        return clientIp.match(range);
                    }
                    else {
                        const allowedIp = ipaddr.process(allowedRange);
                        return clientIp.toString() === allowedIp.toString();
                    }
                }
                catch (e) {
                    this.logger.error(`Failed to parse IP or CIDR range from DB: ${allowedRange}`, e);
                    return false;
                }
            });
            if (!isAllowed) {
                this.logger.warn(`Access Denied. IP ${clientIpStr} is not in the allowlist for SP ${clientId}`);
                throw new common_1.ForbiddenException('IP Address is not allowed for this Service Provider');
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException)
                throw error;
            this.logger.error('Error during IP allowlist validation', error);
            throw new common_1.ForbiddenException('Failed to validate IP address');
        }
    }
};
exports.IpAllowlistGuard = IpAllowlistGuard;
exports.IpAllowlistGuard = IpAllowlistGuard = IpAllowlistGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sp_service_1.SpService])
], IpAllowlistGuard);
//# sourceMappingURL=ip-allowlist.guard.js.map