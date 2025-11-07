import { BaseService } from "@config/service/base.service";
import { Feedback } from "../entities/feedback.entity";
import { FeedbackRepository } from "../repository/feedback-repository.interface";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetManyQuery } from "@common/constant";

@Injectable()
export class FeedbackService extends BaseService<Feedback, FeedbackRepository> {
    constructor(
        @InjectRepository(Entity.FEEDBACK)
        private readonly feedbackRepository: FeedbackRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        super(feedbackRepository);
    }

    /**
     * Lấy danh sách feedback với thông tin user
     */
    async getManyWithUsers(
        user: User,
        conditions: any,
        query?: GetManyQuery<Feedback>,
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
}
