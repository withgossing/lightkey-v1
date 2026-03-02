import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
export declare class SyncService implements OnModuleInit {
    private readonly configService;
    private readonly userRepository;
    private readonly roleRepository;
    private readonly logger;
    constructor(configService: ConfigService, userRepository: Repository<User>, roleRepository: Repository<Role>);
    onModuleInit(): Promise<void>;
    handleCronSync(): Promise<void>;
    syncUsersFromFile(): Promise<void>;
    private ensureRoleExists;
}
