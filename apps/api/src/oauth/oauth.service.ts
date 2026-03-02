import { Injectable, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { JwtService } from '@nestjs/jwt';
import { SpService } from '../sp/sp.service';
import { v4 as uuidv4 } from 'uuid';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class OauthService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly spService: SpService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * 사용자가 SSO 로그인을 완료하고 앱 접근을 허가하면 인가 코드를 발급합니다.
     * 발급된 코드는 5분간 유효하며 Redis에 임시 저장됩니다.
     */
    async generateAuthorizationCode(userId: string, clientId: string, redirectUri: string): Promise<string> {
        // 1. 서비스 제공자(SP) 유효성 검증
        const sp = await this.spService.findByClientId(clientId);
        if (!sp) {
            throw new NotFoundException('Invalid client_id');
        }

        // 보안 검토: redirectUri가 사전 등록된 URL과 일치하는지 검증하는 로직 추가 필요.
        // 현재는 DB 설계에 redirectUri를 명시하지 않았으므로 생략하지만 프로덕션에서는 필수입니다.

        // 2. 인가 코드 생성 (랜덤 UUID)
        const code = uuidv4();

        // 3. Redis 저장 (TTL: 5분 = 300초)
        const payload = JSON.stringify({ userId, clientId, redirectUri });
        await this.redis.set(`auth_code:${code}`, payload, 'EX', 300);

        return code;
    }

    /**
     * 외부 앱 서버(M2M)가 인가 코드를 제출하면 실제 토큰(Access Token)으로 교환합니다.
     */
    async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
        // 1. 서비스 제공자(SP) 자격 증명(M2M) 검증
        const sp = await this.spService.validateClientCredentials(clientId, clientSecret);
        if (!sp) {
            throw new UnauthorizedException('Invalid client credentials');
        }

        // 2. Redis에서 인가 코드 검증 및 즉시 파기 (One-time use)
        const redisKey = `auth_code:${code}`;
        const payloadStr = await this.redis.get(redisKey);

        if (!payloadStr) {
            throw new UnauthorizedException('Invalid or expired authorization code');
        }

        // 보안 원칙 1: 인가 코드는 1회용이어야 하므로 조회 즉시 삭제!
        await this.redis.del(redisKey);

        const payload = JSON.parse(payloadStr);

        // 3. 요청 정보 무결성 검증
        if (payload.clientId !== clientId || payload.redirectUri !== redirectUri) {
            throw new UnauthorizedException('Authorization code context does not match');
        }

        // 4. Access Token 발급 및 반환
        // (OIDC 확장을 고려하면 여기에 id_token까지 함께 서명하여 포함시킵니다.)
        const accessToken = this.jwtService.sign(
            { sub: payload.userId, sp: clientId },
            { expiresIn: '1h' as any } // 외부 앱용 단기 토큰 수명
        );

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600, // 1 hour
            // id_token: idToken (OIDC 추가 시 기입)
        };
    }
}
