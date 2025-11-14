import { RequestAuthData } from "@common/constant/class/request-auth-data";
import {
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    private readonly logger = new Logger(JwtAuthGuard.name);

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();

        // Nếu JwtSsoGuard đã xác thực và gắn RequestAuthData vào request,
        // bỏ qua việc xác thực lại với chiến lược JWT của backend.
        if (request.user instanceof RequestAuthData) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest<TUser = any>(
        err: any,
        user: TUser,
        info: any,
        context: ExecutionContext,
        status?: any,
    ): TUser {
        if (err || info) {
            this.logger.warn(
                `JWT auth failed: ${info instanceof Error ? info.message : info}`,
            );
        }
        if (user) {
            return user;
        }
        const requestUser = context.switchToHttp().getRequest<Request>().user;
        if (requestUser instanceof RequestAuthData) {
            return requestUser as unknown as TUser;
        }
        throw err || new UnauthorizedException(status);
    }
}
