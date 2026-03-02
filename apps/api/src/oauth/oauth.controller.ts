import { Controller, Get, Post, Query, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { OauthService } from './oauth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IpAllowlistGuard } from '../sp/guards/ip-allowlist.guard';

// Removed Authenticated Request wrapper for build compatibility

@Controller('oauth')
export class OauthController {
    constructor(private readonly oauthService: OauthService) { }

    /**
     * 외부 앱에서 사용자를 SSO 로그인 페이지로 라우팅하는 엔드포인트입니다.
     * 사용자가 브라우저 세션(HttpOnly Cookie)을 가지고 있다면 즉시 인가 코드를 발급해
     * 지정된 redirect_uri 로 되돌려 보냅니다.
     * 로그인되어 있지 않다면 프론트엔드 통합 로그인 화면으로 리다이렉트합니다.
     */
    @Get('authorize')
    @UseGuards(JwtAuthGuard) // 사용자가 이미 로그인 상태여야 접근 가능
    async authorize(
        @Req() req: Request,
        @Res() res: Response,
        @Query('response_type') responseType: string,
        @Query('client_id') clientId: string,
        @Query('redirect_uri') redirectUri: string,
        @Query('state') state?: string,
    ) {
        if (responseType !== 'code') {
            return res.status(400).json({ error: 'unsupported_response_type' });
        }

        if (!clientId || !redirectUri) {
            return res.status(400).json({ error: 'invalid_request', message: 'Missing client_id or redirect_uri' });
        }

        try {
            // 사용자 객체는 JwtAuthGuard 통과 시 req.user에 주입됩니다.
            const user = req.user as { userId: string } | undefined;
            if (!user || !user.userId) {
                return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
            }
            const userId = user.userId;

            // 인가 코드 발급 요청
            const code = await this.oauthService.generateAuthorizationCode(userId, clientId, redirectUri);

            // 외부 앱의 redirect_uri로 되돌려 보냄 (GET ?code=xxx&state=xxx)
            let redirectUrl = `${redirectUri}?code=${code}`;
            if (state) {
                redirectUrl += `&state=${encodeURIComponent(state)}`;
            }

            return res.redirect(redirectUrl);
        } catch (error: unknown) {
            // 올바르지 않은 clientId 등.
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return res.status(400).json({ error: 'invalid_request', message });
        }
    }

    /**
     * 외부 앱 서버가 받은 Authorization Code를 가지고 토큰(Access Token)으로 교환하는 엔드포인트입니다.
     * M2M 통신이므로 보안을 위해 발급된 IP 화이트리스트 검사(IpAllowlistGuard)를 권장합니다.
     */
    @Post('token')
    @UseGuards(IpAllowlistGuard)
    async exchangeToken(
        @Body('grant_type') grantType: string,
        @Body('client_id') clientId: string,
        @Body('client_secret') clientSecret: string,
        @Body('code') code: string,
        @Body('redirect_uri') redirectUri: string,
    ) {
        if (grantType !== 'authorization_code') {
            throw new UnauthorizedException('unsupported_grant_type');
        }

        if (!clientId || !clientSecret || !code || !redirectUri) {
            throw new UnauthorizedException('invalid_request');
        }

        const tokens = await this.oauthService.exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
        return tokens;
    }
}
