import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // Determine sync strategy based on environment
    const isTestEnv =
      this.configService.get<string>('NODE_ENV') !== 'production';
    if (isTestEnv) {
      this.logger.log(
        'Test/Dev environment detected: Initiating on-load CSV sync.',
      );
      await this.syncUsersFromFile();
    } else {
      this.logger.log(
        'Production environment detected: On-load sync skipped (Cron will handle it).',
      );
    }
  }

  @Cron('0 3 * * *') // Runs every day at 03:00 AM
  async handleCronSync() {
    const isTestEnv =
      this.configService.get<string>('NODE_ENV') !== 'production';
    if (!isTestEnv) {
      this.logger.log('Executing daily data synchronization Cron job...');
      await this.syncUsersFromFile();
    }
  }

  async syncUsersFromFile() {
    const filePath = this.configService.get<string>('DATA_SYNC_FILE_PATH');
    if (!filePath || !fs.existsSync(filePath)) {
      this.logger.warn(`Data sync file not found at path: ${filePath}`);
      return;
    }

    this.logger.log(`Starting data sync from ${filePath}...`);

    // Ensure basic roles exist
    const adminRole = await this.ensureRoleExists(
      'ROLE_ADMIN',
      'Administrator Role',
    );
    const userRole = await this.ensureRoleExists(
      'ROLE_USER',
      'General Employee Role',
    );

    const parser = fs.createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );

    let count = 0;
    for await (const row of parser) {
      // Expected CSV Columns: employeeId, email, initialPassword, role
      const record = row as {
        employeeId: string;
        email: string;
        initialPassword: string;
        role: string;
      };
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
      const rolesToAssign =
        role === 'ROLE_ADMIN' ? [userRole, adminRole] : [userRole];

      if (user) {
        // Upsert existing user password & email if sync overwrites are needed
        // For security, you might normally *not* overwrite passwords on sync after first setup, but for tests:
        user.email = email || user.email;
        user.passwordHash = passwordHash;
        user.roles = rolesToAssign;
      } else {
        // Create new user
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

  private async ensureRoleExists(
    name: string,
    description: string,
  ): Promise<Role> {
    let role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      role = this.roleRepository.create({ name, description });
      await this.roleRepository.save(role);
      this.logger.log(`Created default role: ${name}`);
    }
    return role;
  }
}
