import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';
export declare class SpService {
    private readonly spRepository;
    constructor(spRepository: Repository<ServiceProvider>);
    findByClientId(clientId: string): Promise<ServiceProvider | null>;
    validateClientCredentials(clientId: string, clientSecret: string): Promise<ServiceProvider | null>;
}
