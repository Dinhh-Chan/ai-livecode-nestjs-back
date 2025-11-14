import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { Configuration } from "@config/configuration";
import { AccessSsoJwtPayload } from "@module/auth/auth.interface";
import { InjectRedisClient } from "@module/redis/redis-client.provider";
import { SsoService } from "@module/sso/sso.service";
import { User } from "@module/user/entities/user.entity";
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Redis from "ioredis";

@Injectable()
export class JwtSsoGuard implements CanActivate {
    private JWKS_CERTS_KEY = "jwts:certs";
    private readonly logger = new Logger(JwtSsoGuard.name);
    constructor(
        private readonly configService: ConfigService<Configuration>,
        private readonly ssoService: SsoService,
        @InjectRedisClient()
        private readonly redis: Redis,
    ) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>();

        // Nếu đã có user từ JwtAuthGuard (backend JWT), bỏ qua SSO guard
        if (req.user) {
            return true;
        }

        const bearer = req.headers.authorization;
        if (!bearer) {
            // Không có token, để JwtAuthGuard xử lý
            return true;
        }

        // Kiểm tra xem token có phải từ Keycloak không
        // Bằng cách decode token (không verify) để xem issuer
        try {
            const token = bearer.substring(7); // Remove "Bearer "
            const parts = token.split(".");
            if (parts.length !== 3) {
                // Token không hợp lệ, để JwtAuthGuard xử lý
                this.logger.debug("Token malformed, skip SSO verification");
                return true;
            }

            // Decode payload (không verify) để kiểm tra issuer
            const payload = JSON.parse(
                Buffer.from(parts[1], "base64").toString("utf-8"),
            );

            // Kiểm tra issuer - nếu không phải từ Keycloak, bỏ qua
            const { jwksUri } = this.configService.get("sso", { infer: true });
            let isKeycloakToken = false;

            if (jwksUri && payload.iss) {
                // Extract realm từ jwksUri: http://.../realms/REALM_NAME/...
                const realmMatch = jwksUri.match(/\/realms\/([^/]+)\//);
                if (realmMatch) {
                    const expectedIssuer = jwksUri
                        .replace("/protocol/openid-connect/certs", "")
                        .replace("/realms/" + realmMatch[1], "");
                    const expectedIssuerFull = `${expectedIssuer}/realms/${realmMatch[1]}`;

                    // Kiểm tra xem issuer có khớp với Keycloak không
                    if (
                        payload.iss.includes(expectedIssuerFull) ||
                        payload.iss === expectedIssuerFull
                    ) {
                        isKeycloakToken = true;
                    }
                }
            }

            // Nếu không phải Keycloak token (không có iss hoặc iss không khớp), bỏ qua
            // Để JwtAuthGuard xử lý token từ backend
            if (!isKeycloakToken) {
                this.logger.debug(
                    "Token issuer không khớp Keycloak, skip SSO verification",
                );
                return true;
            }

            // Token có vẻ từ Keycloak, verify với JWKS
            const verifiedPayload = await this.ssoService.verify(bearer);
            const { usernameField, emailField, firstNameField, lastNameField } =
                this.configService.get("sso", { infer: true });
            const ssoPayload: AccessSsoJwtPayload = {
                jti: verifiedPayload.jti,
                iat: verifiedPayload.iat,
                sub: verifiedPayload.sub,
                scope: String(verifiedPayload.scope),
                username:
                    verifiedPayload[usernameField] &&
                    String(verifiedPayload[usernameField]).toLowerCase(),
                email:
                    verifiedPayload[emailField] &&
                    String(verifiedPayload[emailField]).toLowerCase(),
                firstName:
                    verifiedPayload[firstNameField] &&
                    String(verifiedPayload[firstNameField]).trim(),
                lastName:
                    verifiedPayload[lastNameField] &&
                    String(verifiedPayload[lastNameField]).trim(),
            };
            // Tự động tạo hoặc lấy user từ database và liên kết với SSO
            const user = await this.ssoService.initUser(ssoPayload);

            // Khởi tạo RequestAuthData với user thực từ database
            const requestAuthData = new RequestAuthData(
                ssoPayload,
                async () => user,
            );
            req.user = requestAuthData;
            return true;
        } catch (error) {
            // Verify fail hoặc không phải Keycloak token
            // Không throw exception, để JwtAuthGuard xử lý token từ backend
            this.logger.warn(
                `SSO verify failed: ${error instanceof Error ? error.message : String(error)}`,
            );
            return true;
        }
    }
}
