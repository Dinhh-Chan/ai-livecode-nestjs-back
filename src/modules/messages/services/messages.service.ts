import { BaseService } from "@config/service/base.service";
import { Message } from "../entities/messages.entity";
import { MessagesRepository } from "../repository/messages-repository.interface";
import {
    Injectable,
    Inject,
    forwardRef,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { SessionsService } from "@module/sessions/services/sessions.service";
import { GetManyQuery } from "@common/constant";
import { SystemRole } from "@module/user/common/constant";
import { ApiError } from "@config/exception/api-error";

@Injectable()
export class MessagesService extends BaseService<Message, MessagesRepository> {
    constructor(
        @InjectRepository(Entity.MESSAGES)
        private readonly messagesRepository: MessagesRepository,
        @Inject(forwardRef(() => SessionsService))
        private readonly sessionsService: SessionsService,
    ) {
        super(messagesRepository);
    }

    /**
     * Lấy danh sách messages theo session_id
     */
    async getBySessionId(
        user: User,
        sessionId: string,
        query?: GetManyQuery<Message>,
    ): Promise<any[]> {
        // Kiểm tra session có tồn tại và user có quyền truy cập không
        const session = await this.sessionsService.getById(user, sessionId);
        if (!session) {
            throw new BadRequestException("Session not found");
        }

        // Nếu không phải admin, kiểm tra user có phải chủ sở hữu session không
        if (
            user.systemRole !== SystemRole.ADMIN &&
            session.user_id !== user._id
        ) {
            throw new BadRequestException(
                "You don't have permission to access this session",
            );
        }

        // Nếu không có sort được chỉ định, mặc định sort theo createdAt giảm dần (mới nhất trước)
        const finalQuery: GetManyQuery<Message> = {
            ...query,
            sort: query?.sort || { createdAt: -1 },
        };

        return this.getMany(user, { session_id: sessionId }, finalQuery);
    }

    /**
     * Lấy danh sách messages với điều kiện, tự động filter theo sessions của user nếu không phải admin
     */
    async getManyWithUserFilter(
        user: User,
        conditions: any,
        query?: GetManyQuery<Message>,
    ): Promise<any[]> {
        // Nếu không phải admin, chỉ hiển thị messages của sessions thuộc về user đó
        if (user.systemRole !== SystemRole.ADMIN) {
            // Lấy danh sách session_ids của user
            const sessions = await this.sessionsService.getMany(
                user,
                { user_id: user._id },
                {},
            );
            const sessionIds = (sessions as any[]).map((s: any) => s._id);
            if (sessionIds.length === 0) {
                return [];
            }
            conditions = {
                ...conditions,
                session_id: { $in: sessionIds },
            };
        }
        return this.getMany(user, conditions, query || {});
    }

    /**
     * Xóa message theo id, chỉ cho phép xóa message của chính user hoặc admin
     */
    async deleteById(user: User, id: string) {
        // Lấy message theo id
        const message = await this.getById(user, id);
        if (!message) {
            throw new BadRequestException("Message not found");
        }

        // Lấy session của message
        const session = await this.sessionsService.getById(
            user,
            message.session_id,
        );
        if (!session) {
            throw new BadRequestException("Session not found");
        }

        // Kiểm tra quyền: chỉ cho phép xóa nếu user là chủ sở hữu session hoặc là admin
        if (
            user.systemRole !== SystemRole.ADMIN &&
            session.user_id !== user._id
        ) {
            throw ApiError.Forbidden("error-forbidden");
        }

        // Xóa message
        return super.deleteById(user, id);
    }
}
