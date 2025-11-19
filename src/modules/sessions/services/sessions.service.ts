import { BaseService } from "@config/service/base.service";
import { Session } from "../entities/sessions.entity";
import { SessionsRepository } from "../repository/sessions-repository.interface";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetManyQuery } from "@common/constant";
import { ApiError } from "@config/exception/api-error";
import { SystemRole } from "@module/user/common/constant";

@Injectable()
export class SessionsService extends BaseService<Session, SessionsRepository> {
    constructor(
        @InjectRepository(Entity.SESSIONS)
        private readonly sessionsRepository: SessionsRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        super(sessionsRepository);
    }

    /**
     * Lấy danh sách sessions với thông tin user
     */
    async getManyWithUsers(
        user: User,
        conditions: any,
        query?: GetManyQuery<Session>,
    ): Promise<any[]> {
        const list = await this.getMany(user, conditions, query || {});
        if ((list as any[]).length === 0) return list as any[];
        const userIds = Array.from(
            new Set((list as any[]).map((i) => i.user_id).filter(Boolean)),
        );
        let userMap = new Map<string, any>();
        if (userIds.length > 0) {
            const users = await this.userService.getMany(
                user,
                { _id: { $in: userIds } } as any,
                {},
            );
            userMap = new Map(
                users.map((u: any) => [
                    u._id,
                    {
                        _id: u._id,
                        username: u.username,
                        fullname: u.fullname,
                        email: u.email,
                    },
                ]),
            );
        }
        return (list as any[]).map((i) => ({
            ...i,
            user_basic: userMap.get(i.user_id) || null,
        }));
    }

    async deleteById(user: User, id: string) {
        const session = await this.sessionsRepository.getById(id, {});
        if (!session) {
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy session",
            });
        }

        if (
            user.systemRole !== SystemRole.ADMIN &&
            session.user_id !== user._id
        ) {
            throw ApiError.Forbidden("error-forbidden");
        }

        return super.deleteById(user, id);
    }
}
