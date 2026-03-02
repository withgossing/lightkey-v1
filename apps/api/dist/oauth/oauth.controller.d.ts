import type { Request, Response } from 'express';
import { OauthService } from './oauth.service';
export declare class OauthController {
    private readonly oauthService;
    constructor(oauthService: OauthService);
    authorize(req: Request, res: Response, responseType: string, clientId: string, redirectUri: string, state?: string): Promise<void | Response<any, Record<string, any>>>;
    exchangeToken(grantType: string, clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
}
