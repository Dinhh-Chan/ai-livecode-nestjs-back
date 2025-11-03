import { BaseService } from "@config/service/base.service";
import {
    ContestUsers,
    ContestUserStatus,
} from "../entities/contest-users.entity";
import { ContestUsersRepository } from "../repository/contest-users-repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ApiError } from "@config/exception/api-error";

@Injectable()
export class ContestUsersService extends BaseService<
    ContestUsers,
    ContestUsersRepository
> {
    private readonly logger = new Logger(ContestUsersService.name);

    constructor(
        @InjectRepository(Entity.CONTEST_USERS)
        private readonly contestUsersRepository: ContestUsersRepository,
    ) {
        super(contestUsersRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<ContestUsers>,
    ): Promise<ContestUsers[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { accepted_count: -1, order_index: 1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<ContestUsers>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { accepted_count: -1, order_index: 1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }

    async incrementAcceptedCount(
        user: User,
        contestId: string,
        userId: string,
        incrementBy: number = 1,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { $inc: { accepted_count: incrementBy } } as any,
        );
    }

    async setManager(
        user: User,
        contestId: string,
        userId: string,
        isManager: boolean,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { is_manager: isManager } as any,
        );
    }

    /**
     * User request tham gia contest
     */
    async requestJoin(user: User, contestId: string): Promise<ContestUsers> {
        // Kiểm tra xem user đã có request chưa
        const existing = await this.getOne(
            user,
            { contest_id: contestId, user_id: user._id } as any,
            {},
        );

        if (existing) {
            // Nếu đã có và đang PENDING, không cần tạo lại
            if (existing.status === ContestUserStatus.PENDING) {
                this.logger.log(
                    `User ${user._id} already has pending request for contest ${contestId}`,
                );
                return existing;
            }
            // Nếu đã ENROLLED hoặc REJECTED, có thể cho phép request lại
            if (existing.status === ContestUserStatus.ENROLLED) {
                throw ApiError.BadRequest(
                    "error-contest-user-already-enrolled",
                    {
                        message: "Bạn đã tham gia contest này",
                    },
                );
            }
        }

        // Tạo request mới với status PENDING
        return this.create(user, {
            contest_id: contestId,
            user_id: user._id,
            status: ContestUserStatus.PENDING,
            accepted_count: 0,
            is_manager: false,
            order_index: 0,
        } as any);
    }

    /**
     * Admin approve request của user
     */
    async approveRequest(
        user: User,
        contestId: string,
        userId: string,
    ): Promise<ContestUsers> {
        const contestUser = await this.getOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            {},
        );

        if (!contestUser) {
            throw ApiError.NotFound("error-contest-user-not-found", {
                message: "Không tìm thấy request tham gia contest",
            });
        }

        if (contestUser.status === ContestUserStatus.ENROLLED) {
            this.logger.log(
                `User ${userId} already enrolled in contest ${contestId}`,
            );
            return contestUser;
        }

        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { status: ContestUserStatus.ENROLLED } as any,
        );
    }

    /**
     * Admin reject request của user
     */
    async rejectRequest(
        user: User,
        contestId: string,
        userId: string,
    ): Promise<ContestUsers> {
        const contestUser = await this.getOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            {},
        );

        if (!contestUser) {
            throw ApiError.NotFound("error-contest-user-not-found", {
                message: "Không tìm thấy request tham gia contest",
            });
        }

        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { status: ContestUserStatus.REJECTED } as any,
        );
    }

    /**
     * Admin add user trực tiếp vào contest (status = ENROLLED)
     */
    async addUser(
        user: User,
        contestId: string,
        userId: string,
    ): Promise<ContestUsers> {
        // Kiểm tra xem user đã có trong contest chưa
        const existing = await this.getOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            {},
        );

        if (existing) {
            // Nếu đã có, update status thành ENROLLED
            if (existing.status === ContestUserStatus.ENROLLED) {
                this.logger.log(
                    `User ${userId} already enrolled in contest ${contestId}`,
                );
                return existing;
            }
            return this.updateOne(
                user,
                { contest_id: contestId, user_id: userId } as any,
                { status: ContestUserStatus.ENROLLED } as any,
            );
        }

        // Tạo mới với status ENROLLED
        return this.create(user, {
            contest_id: contestId,
            user_id: userId,
            status: ContestUserStatus.ENROLLED,
            accepted_count: 0,
            is_manager: false,
            order_index: 0,
        } as any);
    }

    /**
     * User bắt đầu làm bài trong contest (set start_at = now)
     */
    async start(user: User, contestId: string): Promise<ContestUsers> {
        // Kiểm tra xem user đã tham gia contest chưa
        const contestUser = await this.getOne(
            user,
            { contest_id: contestId, user_id: user._id } as any,
            {},
        );

        if (!contestUser) {
            throw ApiError.NotFound("error-contest-user-not-found", {
                message: "Bạn chưa tham gia contest này",
            });
        }

        if (contestUser.status !== ContestUserStatus.ENROLLED) {
            throw ApiError.BadRequest("error-contest-user-not-enrolled", {
                message: "Bạn chưa được duyệt tham gia contest này",
            });
        }

        // Nếu đã có start_at rồi thì không cập nhật lại
        if (contestUser.start_at) {
            this.logger.log(
                `User ${user._id} already started contest ${contestId} at ${contestUser.start_at}`,
            );
            return contestUser;
        }

        // Set start_at = now
        const now = new Date();
        return this.updateOne(
            user,
            { contest_id: contestId, user_id: user._id } as any,
            { start_at: now } as any,
        );
    }

    /**
     * Admin add nhiều users cùng lúc vào contest (status = ENROLLED)
     */
    async addMultipleUsers(
        user: User,
        contestId: string,
        userIds: string[],
    ): Promise<{
        success: number;
        failed: number;
        results: Array<{
            user_id: string;
            success: boolean;
            message?: string;
        }>;
    }> {
        const results: Array<{
            user_id: string;
            success: boolean;
            message?: string;
        }> = [];

        let successCount = 0;
        let failedCount = 0;

        for (const userId of userIds) {
            try {
                // Kiểm tra xem user đã có trong contest chưa
                const existing = await this.getOne(
                    user,
                    { contest_id: contestId, user_id: userId } as any,
                    {},
                );

                if (existing) {
                    // Nếu đã có, update status thành ENROLLED nếu chưa phải ENROLLED
                    if (existing.status !== ContestUserStatus.ENROLLED) {
                        await this.updateOne(
                            user,
                            { contest_id: contestId, user_id: userId } as any,
                            { status: ContestUserStatus.ENROLLED } as any,
                        );
                    }
                    results.push({
                        user_id: userId,
                        success: true,
                        message: "User đã được cập nhật thành ENROLLED",
                    });
                    successCount++;
                } else {
                    // Tạo mới với status ENROLLED
                    await this.create(user, {
                        contest_id: contestId,
                        user_id: userId,
                        status: ContestUserStatus.ENROLLED,
                        accepted_count: 0,
                        is_manager: false,
                        order_index: 0,
                    } as any);
                    results.push({
                        user_id: userId,
                        success: true,
                        message: "User đã được thêm vào contest",
                    });
                    successCount++;
                }
            } catch (error: any) {
                this.logger.error(
                    `Error adding user ${userId} to contest ${contestId}: ${error.message}`,
                );
                results.push({
                    user_id: userId,
                    success: false,
                    message: error.message || "Lỗi không xác định",
                });
                failedCount++;
            }
        }

        return {
            success: successCount,
            failed: failedCount,
            results,
        };
    }
}
