import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('auth_sessions')
export class AuthSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    userId: string;

    @Column()
    tokenHash: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
