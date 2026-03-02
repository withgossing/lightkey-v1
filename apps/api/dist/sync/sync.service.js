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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const fs = __importStar(require("fs"));
const csv_parse_1 = require("csv-parse");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
let SyncService = SyncService_1 = class SyncService {
    configService;
    userRepository;
    roleRepository;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(configService, userRepository, roleRepository) {
        this.configService = configService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async onModuleInit() {
        const isTestEnv = this.configService.get('NODE_ENV') !== 'production';
        if (isTestEnv) {
            this.logger.log('Test/Dev environment detected: Initiating on-load CSV sync.');
            await this.syncUsersFromFile();
        }
        else {
            this.logger.log('Production environment detected: On-load sync skipped (Cron will handle it).');
        }
    }
    async handleCronSync() {
        const isTestEnv = this.configService.get('NODE_ENV') !== 'production';
        if (!isTestEnv) {
            this.logger.log('Executing daily data synchronization Cron job...');
            await this.syncUsersFromFile();
        }
    }
    async syncUsersFromFile() {
        const filePath = this.configService.get('DATA_SYNC_FILE_PATH');
        if (!filePath || !fs.existsSync(filePath)) {
            this.logger.warn(`Data sync file not found at path: ${filePath}`);
            return;
        }
        this.logger.log(`Starting data sync from ${filePath}...`);
        const adminRole = await this.ensureRoleExists('ROLE_ADMIN', 'Administrator Role');
        const userRole = await this.ensureRoleExists('ROLE_USER', 'General Employee Role');
        const parser = fs.createReadStream(filePath).pipe((0, csv_parse_1.parse)({
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }));
        let count = 0;
        for await (const row of parser) {
            const record = row;
            const employeeId = record.employeeId;
            const email = record.email;
            const initialPassword = record.initialPassword;
            const role = record.role;
            if (!employeeId || !initialPassword) {
                this.logger.warn(`Skipping invalid record: ${JSON.stringify(record)}`);
                continue;
            }
            let user = await this.userRepository.findOne({ where: { employeeId } });
            const passwordHash = await bcrypt.hash(initialPassword, 10);
            const rolesToAssign = role === 'ROLE_ADMIN' ? [userRole, adminRole] : [userRole];
            if (user) {
                user.email = email || user.email;
                user.passwordHash = passwordHash;
                user.roles = rolesToAssign;
            }
            else {
                user = this.userRepository.create({
                    employeeId,
                    email,
                    passwordHash,
                    roles: rolesToAssign,
                });
            }
            await this.userRepository.save(user);
            count++;
        }
        this.logger.log(`Successfully synchronized ${count} users from CSV.`);
    }
    async ensureRoleExists(name, description) {
        let role = await this.roleRepository.findOne({ where: { name } });
        if (!role) {
            role = this.roleRepository.create({ name, description });
            await this.roleRepository.save(role);
            this.logger.log(`Created default role: ${name}`);
        }
        return role;
    }
};
exports.SyncService = SyncService;
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncService.prototype, "handleCronSync", null);
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SyncService);
//# sourceMappingURL=sync.service.js.map