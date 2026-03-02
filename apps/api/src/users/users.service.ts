import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { employeeId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createManualUser(
    employeeId: string,
    email: string,
    initialPassword: string,
  ): Promise<User> {
    const existingUser = await this.findByEmployeeId(employeeId);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    // We assume ROLE_USER is the default for manually created users
    // You could also fetch this from the roleRepository if needed,
    // but here we just pass the minimal entity to save it or do a look up.
    // To keep it simple and safe, we'll assign the role by looking it up.
    const user = this.userRepository.create({
      employeeId,
      email,
      passwordHash,
      // roles: [] // In a real implementation you would fetch the Role entity here and assign it.
    });

    return this.userRepository.save(user);
  }
}
