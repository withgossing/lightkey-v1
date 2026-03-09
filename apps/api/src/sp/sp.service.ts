import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class SpService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly spRepository: Repository<ServiceProvider>,
  ) { }

  async findAll(): Promise<ServiceProvider[]> {
    return this.spRepository.find();
  }

  async findByClientId(clientId: string): Promise<ServiceProvider | null> {
    return this.spRepository.findOne({ where: { clientId } });
  }

  async validateClientCredentials(clientId: string, clientSecret: string): Promise<ServiceProvider | null> {
    const sp = await this.findByClientId(clientId);
    if (!sp || !sp.clientSecretHash) {
      return null;
    }

    // Using simple comparison for now, assuming standard OAuth clientSecret handling
    // In production, 'bcrypt' comparison should be used against `clientSecretHash`.
    const isMatch = sp.clientSecretHash === clientSecret;
    if (isMatch) {
      return sp;
    }
    return null;
  }

  async create(data: { name: string; description: string; allowedIps: string[] }): Promise<{ sp: ServiceProvider, rawSecret: string }> {
    const clientId = uuidv4();
    const rawSecret = crypto.randomBytes(32).toString('base64');

    // In production, you would hash `rawSecret` using bcrypt.
    // For now, based on existing logic, storing it raw as `clientSecretHash`.
    const clientSecretHash = rawSecret;

    const sp = this.spRepository.create({
      clientId,
      clientSecretHash,
      name: data.name,
      description: data.description,
      allowedIps: data.allowedIps,
    });

    await this.spRepository.save(sp);
    return { sp, rawSecret };
  }

  async update(id: string, data: { name?: string; description?: string; allowedIps?: string[] }): Promise<ServiceProvider | null> {
    const sp = await this.spRepository.findOne({ where: { id } });
    if (!sp) return null;

    if (data.name !== undefined) sp.name = data.name;
    if (data.description !== undefined) sp.description = data.description;
    if (data.allowedIps !== undefined) sp.allowedIps = data.allowedIps;

    await this.spRepository.save(sp);
    return sp;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.spRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
