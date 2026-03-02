import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('service_providers')
export class ServiceProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecretHash: string; // The hashed secret to verify client identity

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true })
  allowedIps: string[]; // Store allowed IPs or CIDRs as a simple comma-separated array

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
