"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthModule = void 0;
const common_1 = require("@nestjs/common");
const oauth_service_1 = require("./oauth.service");
const oauth_controller_1 = require("./oauth.controller");
const sp_module_1 = require("../sp/sp.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_code_entity_1 = require("../auth/entities/auth-code.entity");
let OauthModule = class OauthModule {
};
exports.OauthModule = OauthModule;
exports.OauthModule = OauthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([auth_code_entity_1.AuthCode]),
            sp_module_1.SpModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                }),
            }),
        ],
        providers: [oauth_service_1.OauthService],
        controllers: [oauth_controller_1.OauthController]
    })
], OauthModule);
//# sourceMappingURL=oauth.module.js.map