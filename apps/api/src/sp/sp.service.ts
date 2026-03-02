import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';

@Injectable()
export class SpService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly spRepository: Repository<ServiceProvider>,
  ) { }

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
}
