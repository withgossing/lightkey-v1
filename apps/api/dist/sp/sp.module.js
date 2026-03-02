"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sp_service_1 = require("./sp.service");
const service_provider_entity_1 = require("./entities/service-provider.entity");
const ip_allowlist_guard_1 = require("./guards/ip-allowlist.guard");
let SpModule = class SpModule {
};
exports.SpModule = SpModule;
exports.SpModule = SpModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([service_provider_entity_1.ServiceProvider])],
        providers: [sp_service_1.SpService, ip_allowlist_guard_1.IpAllowlistGuard],
        exports: [sp_service_1.SpService, ip_allowlist_guard_1.IpAllowlistGuard],
    })
], SpModule);
//# sourceMappingURL=sp.module.js.map