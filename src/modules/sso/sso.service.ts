import { Configuration } from "@config/configuration";
import { AccessSsoJwtPayload } from "@module/auth/auth.interface";
import { AuthRepository } from "@module/auth/repository/auth-repository.interface";
import { InjectRedisClient } from "@module/redis/redis-client.provider";
import { Entity } from "@module/repository";
import { InjectRepository } from "@module/repository/common/repository";
import { SystemRole } from "@module/user/common/constant";
import { UserRepository } from "@module/user/repository/user-repository.interface";
import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { JWTPayload, createLocalJWKSet, jwtVerify } from "jose";

@Injectable()
export class SsoService {
    private JWKS_CERTS_KEY = "jwts:certs";
    constructor(
        @InjectRepository(Entity.USER)
        private readonly userRepository: UserRepository,
        @InjectRepository(Entity.AUTH)
        private readonly authRepository: AuthRepository,
        @InjectRedisClient()
        private readonly redis: Redis,
        private readonly configService: ConfigService<Configuration>,
    ) {}

    async getUser(payload: AccessSsoJwtPayload) {
        // Tìm user theo ssoId trước (nếu đã liên kết)
        if (payload.sub) {
            const userBySsoId = await this.userRepository.getOne({
                ssoId: payload.sub,
            } as any);
            if (userBySsoId) {
                return userBySsoId;
            }
        }

        // Tìm theo email
        if (payload.email) {
            const userByEmail = await this.userRepository.getOne({
                email: payload.email,
            } as any);
            if (userByEmail) {
                return userByEmail;
            }
        }

        // Tìm theo username
        if (payload.username) {
            const userByUsername = await this.userRepository.getOne({
                username: payload.username,
            } as any);
            if (userByUsername) {
                return userByUsername;
            }
        }

        return null;
    }

    async initUser(payload: AccessSsoJwtPayload) {
        let user = await this.getUser(payload);

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = await this.userRepository.create({
                ssoId: payload.sub,
                username: payload.username,
                email: payload.email,
                firstname: payload.firstName,
                lastname: payload.lastName,
                fullname: [payload.lastName, payload.firstName]
                    .filter(Boolean)
                    .join(" "),
                systemRole: SystemRole.USER,
            });
        } else {
            // User đã tồn tại, cập nhật ssoId và thông tin nếu cần
            const updateData: any = {};

            // Cập nhật ssoId nếu chưa có
            if (!user.ssoId && payload.sub) {
                updateData.ssoId = payload.sub;
            }

            // Cập nhật thông tin nếu thiếu
            if (!user.firstname && payload.firstName) {
                updateData.firstname = payload.firstName;
            }
            if (!user.lastname && payload.lastName) {
                updateData.lastname = payload.lastName;
            }
            if (!user.fullname && (payload.firstName || payload.lastName)) {
                updateData.fullname = [payload.lastName, payload.firstName]
                    .filter(Boolean)
                    .join(" ");
            }

            // Chỉ update nếu có thay đổi
            if (Object.keys(updateData).length > 0) {
                user = await this.userRepository.updateById(
                    user._id,
                    updateData,
                );
            }
        }

        return user;
    }

    private async getCerts() {
        let certs = await this.redis.get(this.JWKS_CERTS_KEY);
        try {
            if (!certs) {
                const { jwksUri } = this.configService.get("sso", {
                    infer: true,
                });
                if (!jwksUri) {
                    throw new InternalServerErrorException();
                }
                certs = await fetch(jwksUri).then(async (res) =>
                    JSON.stringify(await res.json()),
                );
                this.redis.set(this.JWKS_CERTS_KEY, certs, "EX", 4);
            }
            return JSON.parse(certs);
        } catch (err) {
            console.error(err.mesasge);
            throw new InternalServerErrorException();
        }
    }

    async verify(bearer: string): Promise<JWTPayload> {
        if (bearer && bearer.substring(0, 7).toLowerCase() === "bearer ") {
            // Lấy token và verify với JWKS
            try {
                const token = bearer.substring(7);
                const certs = await this.getCerts();
                const JWKS = createLocalJWKSet(certs);
                const { payload } = await jwtVerify(token, JWKS);
                return payload;
            } catch (err) {
                console.error("??", err);
                throw new UnauthorizedException();
            }
        } else {
            throw new UnauthorizedException();
        }
    }
}
