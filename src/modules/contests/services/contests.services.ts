import { BaseService } from "@config/service/base.service";
import { Contests } from "../entities/contests.entity";
import { ContestsRepository } from "../repository/contests-repository.interface";
import { Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import {
    BaseQueryOption,
    QueryCondition,
} from "@module/repository/common/base-repository.interface";
import { User } from "@module/user/entities/user.entity";
import {
    GetManyQuery,
    GetPageQuery,
    CreateQuery,
    GetByIdQuery,
} from "@common/constant";
import { ContestUsersService } from "@module/contest-users/services/contest-users.services";
import {
    ContestUserStatus,
    ContestUsers,
} from "@module/contest-users/entities/contest-users.entity";
import { ContestProblemsService } from "@module/contest-problems/services/contest-problems.services";
import { ProblemsService } from "@module/problems/services/problems.services";
import { UserService } from "@module/user/service/user.service";

@Injectable()
export class ContestsService extends BaseService<Contests, ContestsRepository> {
    private readonly logger = new Logger(ContestsService.name);

    constructor(
        @InjectRepository(Entity.CONTESTS)
        private readonly contestsRepository: ContestsRepository,
        @Inject(forwardRef(() => ContestUsersService))
        private readonly contestUsersService: ContestUsersService,
        @Inject(forwardRef(() => ContestProblemsService))
        private readonly contestProblemsService: ContestProblemsService,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        super(contestsRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<Contests>,
    ): Promise<Contests[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { created_time: -1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<Contests>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { created_time: -1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }

    /**
     * Override getById để thêm danh sách users và problems
     */
    async getById(
        user: User,
        id: string,
        query?: GetByIdQuery<Contests> & BaseQueryOption<unknown>,
    ): Promise<any> {
        // Lấy contest
        const contest = await super.getById(user, id, query);

        if (!contest) {
            return contest;
        }

        // Lấy danh sách ContestUsers
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                contest_id: id,
            } as any,
            {
                sort: { accepted_count: -1, order_index: 1 },
            },
        );

        // Lấy thông tin đầy đủ của Users
        let contestUsersWithDetails = contestUsers;
        let ranking: any[] = [];
        if (contestUsers.length > 0) {
            const userIds = contestUsers.map((cu: any) => cu.user_id);
            const users = await this.userService.getMany(
                user,
                {
                    _id: { $in: userIds },
                } as any,
                {},
            );

            // Tạo map để dễ dàng lookup
            const userMap = new Map(users.map((u: any) => [u._id, u]));

            // Map lại để gộp thông tin ContestUsers với Users
            // Loại bỏ các trường nhạy cảm như password, ssoId, email
            contestUsersWithDetails = contestUsers.map((cu: any) => {
                const userData = userMap.get(cu.user_id);
                let sanitizedUser = null;
                if (userData) {
                    const { password, ssoId, email, ...rest } = userData;
                    sanitizedUser = rest;
                }
                return {
                    ...cu,
                    user: sanitizedUser,
                };
            });

            // Tính ranking của toàn bộ user trong contest
            // Sắp xếp dựa trên accepted_count (giảm dần), nếu bằng nhau thì dựa trên order_index (tăng dần)
            ranking = [...contestUsersWithDetails]
                .sort((a: any, b: any) => {
                    if (b.accepted_count !== a.accepted_count) {
                        return b.accepted_count - a.accepted_count;
                    }
                    return a.order_index - b.order_index;
                })
                .map((cu: any, index: number) => ({
                    rank: index + 1,
                    ...cu,
                }));
        } else {
            ranking = [];
        }

        // Kiểm tra user hiện tại đã start chưa và status
        const currentUserContestUser = await this.contestUsersService.getOne(
            user,
            {
                contest_id: id,
                user_id: user._id,
            } as any,
            {},
        );

        const is_start = !!currentUserContestUser?.start_at;

        // Xác định status của user hiện tại
        let status: "pending" | "enrolled" | "not-participant";
        if (!currentUserContestUser) {
            status = "not-participant";
        } else if (
            currentUserContestUser.status === ContestUserStatus.PENDING
        ) {
            status = "pending";
        } else if (
            currentUserContestUser.status === ContestUserStatus.ENROLLED
        ) {
            status = "enrolled";
        } else {
            // REJECTED hoặc các trạng thái khác
            status = "not-participant";
        }

        // Lấy danh sách ContestProblems
        const contestProblems = await this.contestProblemsService.getMany(
            user,
            {
                contest_id: id,
            } as any,
            {
                sort: { order_index: 1 },
            },
        );

        // Lấy thông tin đầy đủ của Problems
        if (contestProblems.length > 0) {
            const problemIds = contestProblems.map((cp: any) => cp.problem_id);
            const problems = await this.problemsService.getMany(
                user,
                {
                    _id: { $in: problemIds },
                } as any,
                {},
            );

            // Tạo map để dễ dàng lookup
            const problemMap = new Map(problems.map((p: any) => [p._id, p]));

            // Map lại để gộp thông tin ContestProblems với Problems
            const contestProblemsWithDetails = contestProblems.map(
                (cp: any) => ({
                    ...cp,
                    problem: problemMap.get(cp.problem_id) || null,
                }),
            );

            // Trả về contest kèm danh sách users, problems và ranking
            return {
                ...contest,
                contest_users: contestUsersWithDetails,
                contest_problems: contestProblemsWithDetails,
                ranking,
                is_start,
                status,
            };
        }

        // Trả về contest kèm danh sách users, problems và ranking
        return {
            ...contest,
            contest_users: contestUsersWithDetails,
            contest_problems: contestProblems,
            ranking,
            is_start,
            status,
        };
    }

    /**
     * Lấy các contest đang diễn ra (start_time <= now <= end_time)
     */
    async getOngoingContests(
        user: User,
        query?: GetManyQuery<Contests>,
    ): Promise<any[]> {
        const now = new Date();
        const conditions: any = {
            is_active: true,
            start_time: { $lte: now },
            end_time: { $gte: now },
        };

        const queryWithDefaultSort = {
            ...query,
            sort: query?.sort || { start_time: 1 },
        };

        const contests = await super.getMany(
            user,
            conditions,
            queryWithDefaultSort,
        );

        if (contests.length === 0) {
            return [];
        }

        // Lấy danh sách contest_id
        const contestIds = contests.map((c: any) => c._id);

        // Query ContestUsers để check user đã tham gia chưa
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                user_id: user._id,
                contest_id: { $in: contestIds },
                status: ContestUserStatus.ENROLLED,
            } as any,
            {},
        );

        // Tạo map để dễ dàng lookup
        const enrolledContestIds = new Set(
            contestUsers.map((cu: any) => cu.contest_id),
        );

        // Map lại để thêm is_enrolled
        return contests.map((contest: any) => ({
            ...contest,
            is_enrolled: enrolledContestIds.has(contest._id),
        }));
    }

    /**
     * Lấy các contest đang diễn ra với pagination
     */
    async getOngoingContestsPage(
        user: User,
        query?: GetPageQuery<Contests>,
    ): Promise<any> {
        const now = new Date();
        const conditions: any = {
            is_active: true,
            start_time: { $lte: now },
            end_time: { $gte: now },
        };

        const queryWithDefaultSort = {
            ...query,
            sort: query?.sort || { start_time: 1 },
        };

        const result = await super.getPage(
            user,
            conditions,
            queryWithDefaultSort,
        );

        if (!result.result || result.result.length === 0) {
            return result;
        }

        // Lấy danh sách contest_id
        const contestIds = result.result.map((c: any) => c._id);

        // Query ContestUsers để check user đã tham gia chưa
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                user_id: user._id,
                contest_id: { $in: contestIds },
                status: ContestUserStatus.ENROLLED,
            } as any,
            {},
        );

        // Tạo map để dễ dàng lookup
        const enrolledContestIds = new Set(
            contestUsers.map((cu: any) => cu.contest_id),
        );

        // Map lại để thêm is_enrolled
        const mappedItems = result.result.map((contest: any) => ({
            ...contest,
            is_enrolled: enrolledContestIds.has(contest._id),
        }));

        return {
            ...result,
            result: mappedItems,
        };
    }

    /**
     * Lấy các contest chưa kết thúc (end_time > now)
     * Bao gồm cả contest đang diễn ra và chưa bắt đầu
     */
    async getNotEndedContests(
        user: User,
        query?: GetManyQuery<Contests>,
    ): Promise<any[]> {
        const now = new Date();
        const conditions: any = {
            is_active: true,
            end_time: { $gt: now },
        };

        const queryWithDefaultSort = {
            ...query,
            sort: query?.sort || { start_time: 1 },
        };

        const contests = await super.getMany(
            user,
            conditions,
            queryWithDefaultSort,
        );

        if (contests.length === 0) {
            return [];
        }

        // Lấy danh sách contest_id
        const contestIds = contests.map((c: any) => c._id);

        // Query ContestUsers để check user đã tham gia chưa
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                user_id: user._id,
                contest_id: { $in: contestIds },
                status: ContestUserStatus.ENROLLED,
            } as any,
            {},
        );

        // Tạo map để dễ dàng lookup
        const enrolledContestIds = new Set(
            contestUsers.map((cu: any) => cu.contest_id),
        );

        // Map lại để thêm is_enrolled
        return contests.map((contest: any) => ({
            ...contest,
            is_enrolled: enrolledContestIds.has(contest._id),
        }));
    }

    /**
     * Lấy các contest chưa kết thúc với pagination
     */
    async getNotEndedContestsPage(
        user: User,
        query?: GetPageQuery<Contests>,
    ): Promise<any> {
        const now = new Date();
        const conditions: any = {
            is_active: true,
            end_time: { $gt: now },
        };

        const queryWithDefaultSort = {
            ...query,
            sort: query?.sort || { start_time: 1 },
        };

        const result = await super.getPage(
            user,
            conditions,
            queryWithDefaultSort,
        );

        if (!result.result || result.result.length === 0) {
            return result;
        }

        // Lấy danh sách contest_id
        const contestIds = result.result.map((c: any) => c._id);

        // Query ContestUsers để check user đã tham gia chưa
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                user_id: user._id,
                contest_id: { $in: contestIds },
                status: ContestUserStatus.ENROLLED,
            } as any,
            {},
        );

        // Tạo map để dễ dàng lookup
        const enrolledContestIds = new Set(
            contestUsers.map((cu: any) => cu.contest_id),
        );

        // Map lại để thêm is_enrolled
        const mappedItems = result.result.map((contest: any) => ({
            ...contest,
            is_enrolled: enrolledContestIds.has(contest._id),
        }));

        return {
            ...result,
            result: mappedItems,
        };
    }

    /**
     * Override create method để tự động thêm người tạo vào ContestUsers với is_manager = true
     */
    async create(
        user: User,
        dto: Partial<Contests>,
        options?: CreateQuery<Contests> & BaseQueryOption<unknown>,
    ): Promise<Contests> {
        // Tạo contest
        const contest = await super.create(user, dto, options);

        try {
            // Tự động thêm người tạo vào ContestUsers với is_manager = true và status = ENROLLED
            await this.contestUsersService.create(user, {
                contest_id: contest._id,
                user_id: user._id,
                is_manager: true,
                status: ContestUserStatus.ENROLLED,
                accepted_count: 0,
                order_index: 0,
            } as any);

            this.logger.log(
                `Auto added creator ${user._id} as manager to contest ${contest._id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to add creator as manager to contest ${contest._id}: ${error.message}`,
            );
            // Không throw error để không rollback việc tạo contest
            // Có thể thêm lại manager sau nếu cần
        }

        return contest;
    }

    /**
     * Lấy danh sách contest mà user đang tham gia (ENROLLED) và đang pending (PENDING)
     */
    async getMyContests(
        user: User,
        query?: GetManyQuery<ContestUsers>,
    ): Promise<any[]> {
        // Lấy tất cả ContestUsers của user với status ENROLLED hoặc PENDING
        const contestUsers = await this.contestUsersService.getMany(
            user,
            {
                user_id: user._id,
                status: {
                    $in: [
                        ContestUserStatus.ENROLLED,
                        ContestUserStatus.PENDING,
                    ],
                },
            } as any,
            {
                sort: query?.sort || { created_time: -1 },
            },
        );

        if (contestUsers.length === 0) {
            return [];
        }

        // Lấy danh sách contest_id
        const contestIds = contestUsers.map((cu: any) => cu.contest_id);

        // Query Contests
        const contests = await this.getMany(
            user,
            {
                _id: { $in: contestIds },
            } as any,
            {
                sort: query?.sort || { created_time: -1 },
            },
        );

        // Tạo map để dễ dàng lookup
        const contestUserMap = new Map(
            contestUsers.map((cu: any) => [cu.contest_id, cu]),
        );

        // Map lại để trả về contest info kèm theo status của user
        return contests.map((contest: any) => {
            const contestUser = contestUserMap.get(contest._id);
            return {
                contest,
                status: contestUser?.status,
                is_manager: contestUser?.is_manager || false,
                accepted_count: contestUser?.accepted_count || 0,
                contest_user_id: contestUser?._id,
            };
        });
    }

    /**
     * Lấy danh sách contest mà user đang tham gia với pagination
     */
    async getMyContestsPage(
        user: User,
        query?: GetPageQuery<ContestUsers>,
    ): Promise<any> {
        // Lấy ContestUsers với pagination
        const result = await this.contestUsersService.getPage(
            user,
            {
                user_id: user._id,
                status: {
                    $in: [
                        ContestUserStatus.ENROLLED,
                        ContestUserStatus.PENDING,
                    ],
                },
            } as any,
            {
                sort: query?.sort || { created_time: -1 },
                page: query?.page,
                limit: query?.limit,
                skip: query?.skip,
            },
        );

        if (!result.result || result.result.length === 0) {
            return result;
        }

        // Lấy danh sách contest_id
        const contestIds = result.result.map((cu: any) => cu.contest_id);

        // Query Contests
        const contests = await this.getMany(
            user,
            {
                _id: { $in: contestIds },
            } as any,
            {
                sort: query?.sort || { created_time: -1 },
            },
        );

        // Tạo map để dễ dàng lookup
        const contestUserMap = new Map(
            result.result.map((cu: any) => [cu.contest_id, cu]),
        );

        // Map lại items
        const mappedItems = contests.map((contest: any) => {
            const contestUser: any = contestUserMap.get(contest._id);
            return {
                contest,
                status: contestUser?.status,
                is_manager: contestUser?.is_manager || false,
                accepted_count: contestUser?.accepted_count || 0,
                contest_user_id: contestUser?._id,
            };
        });

        return {
            ...result,
            result: mappedItems,
        };
    }
}
