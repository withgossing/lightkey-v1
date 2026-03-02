import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { SpService } from '../sp/sp.service';
export declare class OauthService {
    private readonly redis;
    private readonly spService;
    private readonly jwtService;
    constructor(redis: Redis, spService: SpService, jwtService: JwtService);
    generateAuthorizationCode(userId: string, clientId: string, redirectUri: string): Promise<string>;
    exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
}
