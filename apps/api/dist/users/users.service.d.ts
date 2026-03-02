import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findByEmployeeId(employeeId: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createManualUser(employeeId: string, email: string, initialPassword: string): Promise<User>;
}
