import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('auth_codes')
export class AuthCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
