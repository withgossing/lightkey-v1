"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthController = void 0;
const common_1 = require("@nestjs/common");
const oauth_service_1 = require("./oauth.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ip_allowlist_guard_1 = require("../sp/guards/ip-allowlist.guard");
let OauthController = class OauthController {
    oauthService;
    constructor(oauthService) {
        this.oauthService = oauthService;
    }
    async authorize(req, res, responseType, clientId, redirectUri, state) {
        if (responseType !== 'code') {
            return res.status(400).json({ error: 'unsupported_response_type' });
        }
        if (!clientId || !redirectUri) {
            return res.status(400).json({ error: 'invalid_request', message: 'Missing client_id or redirect_uri' });
        }
        try {
            const user = req.user;
            if (!user || !user.userId) {
                return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
            }
            const userId = user.userId;
            const code = await this.oauthService.generateAuthorizationCode(userId, clientId, redirectUri);
            let redirectUrl = `${redirectUri}?code=${code}`;
            if (state) {
                redirectUrl += `&state=${encodeURIComponent(state)}`;
            }
            return res.redirect(redirectUrl);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return res.status(400).json({ error: 'invalid_request', message });
        }
    }
    async exchangeToken(grantType, clientId, clientSecret, code, redirectUri) {
        if (grantType !== 'authorization_code') {
            throw new common_1.UnauthorizedException('unsupported_grant_type');
        }
        if (!clientId || !clientSecret || !code || !redirectUri) {
            throw new common_1.UnauthorizedException('invalid_request');
        }
        const tokens = await this.oauthService.exchangeCodeForToken(clientId, clientSecret, code, redirectUri);
        return tokens;
    }
};
exports.OauthController = OauthController;
__decorate([
    (0, common_1.Get)('authorize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('response_type')),
    __param(3, (0, common_1.Query)('client_id')),
    __param(4, (0, common_1.Query)('redirect_uri')),
    __param(5, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OauthController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('token'),
    (0, common_1.UseGuards)(ip_allowlist_guard_1.IpAllowlistGuard),
    __param(0, (0, common_1.Body)('grant_type')),
    __param(1, (0, common_1.Body)('client_id')),
    __param(2, (0, common_1.Body)('client_secret')),
    __param(3, (0, common_1.Body)('code')),
    __param(4, (0, common_1.Body)('redirect_uri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OauthController.prototype, "exchangeToken", null);
exports.OauthController = OauthController = __decorate([
    (0, common_1.Controller)('oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OauthService])
], OauthController);
//# sourceMappingURL=oauth.controller.js.map