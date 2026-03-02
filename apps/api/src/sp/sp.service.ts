import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';

@Injectable()
export class SpService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly spRepository: Repository<ServiceProvider>,
  ) {}

  async findByClientId(clientId: string): Promise<ServiceProvider | null> {
    return this.spRepository.findOne({ where: { clientId } });
  }
}
