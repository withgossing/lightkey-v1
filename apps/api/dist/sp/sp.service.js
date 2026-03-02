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
exports.SpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_provider_entity_1 = require("./entities/service-provider.entity");
let SpService = class SpService {
    spRepository;
    constructor(spRepository) {
        this.spRepository = spRepository;
    }
    async findByClientId(clientId) {
        return this.spRepository.findOne({ where: { clientId } });
    }
    async validateClientCredentials(clientId, clientSecret) {
        const sp = await this.findByClientId(clientId);
        if (!sp || !sp.clientSecretHash) {
            return null;
        }
        const isMatch = sp.clientSecretHash === clientSecret;
        if (isMatch) {
            return sp;
        }
        return null;
    }
};
exports.SpService = SpService;
exports.SpService = SpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_provider_entity_1.ServiceProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SpService);
//# sourceMappingURL=sp.service.js.map