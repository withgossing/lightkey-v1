import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';
export declare class SpService {
    private readonly spRepository;
    constructor(spRepository: Repository<ServiceProvider>);
    findAll(): Promise<ServiceProvider[]>;
    findByClientId(clientId: string): Promise<ServiceProvider | null>;
    validateClientCredentials(clientId: string, clientSecret: string): Promise<ServiceProvider | null>;
    create(data: {
        name: string;
        description: string;
        allowedIps: string[];
    }): Promise<{
        sp: ServiceProvider;
        rawSecret: string;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        allowedIps?: string[];
    }): Promise<ServiceProvider | null>;
    remove(id: string): Promise<boolean>;
}
