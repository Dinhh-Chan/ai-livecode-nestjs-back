import { BaseService } from "@config/service/base.service";
import { ContestProblems } from "../entities/contest-problems.entity";
import { ContestProblemsRepository } from "../repository/contest-problems-repository.interface";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ProblemsService } from "@module/problems/services/problems.services";

@Injectable()
export class ContestProblemsService extends BaseService<
    ContestProblems,
    ContestProblemsRepository
> {
    constructor(
        @InjectRepository(Entity.CONTEST_PROBLEMS)
        private readonly contestProblemsRepository: ContestProblemsRepository,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
    ) {
        super(contestProblemsRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<ContestProblems>,
    ): Promise<ContestProblems[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { order_index: 1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<ContestProblems>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { order_index: 1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }

    /**
     * Lấy danh sách bài tập trong contest theo thứ tự
     */
    async getProblemsByContest(
        user: User,
        contestId: string,
        includeHidden: boolean = false,
    ): Promise<ContestProblems[]> {
        const conditions: any = { contest_id: contestId };

        if (!includeHidden) {
            conditions.is_visible = true;
        }

        return this.getMany(user, conditions, { sort: { order_index: 1 } });
    }

    /**
     * Lấy danh sách bài tập trong contest với thông tin đầy đủ của Problems
     */
    async getProblemsWithDetails(
        user: User,
        contestId: string,
        includeHidden: boolean = false,
    ): Promise<any[]> {
        // Lấy danh sách ContestProblems
        const contestProblems = await this.getProblemsByContest(
            user,
            contestId,
            includeHidden,
        );

        if (contestProblems.length === 0) {
            return [];
        }

        // Lấy thông tin đầy đủ của Problems
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
        const problemsWithDetails = contestProblems.map((cp: any) => {
            const problem = problemMap.get(cp.problem_id);
            return {
                ...cp,
                problem: problem || null,
            };
        });

        return problemsWithDetails;
    }

    /**
     * Cập nhật thứ tự bài tập trong contest
     */
    async updateOrder(
        user: User,
        contestId: string,
        problemId: string,
        newOrder: number,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, problem_id: problemId } as any,
            { order_index: newOrder } as any,
        );
    }

    /**
     * Cập nhật điểm số bài tập trong contest
     */
    async updateScore(
        user: User,
        contestId: string,
        problemId: string,
        newScore: number,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, problem_id: problemId } as any,
            { score: newScore } as any,
        );
    }

    /**
     * Ẩn/hiện bài tập trong contest
     */
    async toggleVisibility(
        user: User,
        contestId: string,
        problemId: string,
        isVisible: boolean,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, problem_id: problemId } as any,
            { is_visible: isVisible } as any,
        );
    }

    /**
     * Admin add nhiều problems cùng lúc vào contest
     */
    async addMultipleProblems(
        user: User,
        contestId: string,
        problems: Array<{
            problem_id: string;
            order_index?: number;
            score?: number;
            is_visible?: boolean;
        }>,
    ): Promise<{
        success: number;
        failed: number;
        results: Array<{
            problem_id: string;
            success: boolean;
            message?: string;
        }>;
    }> {
        const results: Array<{
            problem_id: string;
            success: boolean;
            message?: string;
        }> = [];

        let successCount = 0;
        let failedCount = 0;

        // Lấy order_index lớn nhất hiện tại để set order_index cho các problem mới
        const existingProblems = await this.getMany(
            user,
            { contest_id: contestId } as any,
            { sort: { order_index: -1 } },
        );
        let currentMaxOrderIndex =
            existingProblems.length > 0
                ? (existingProblems[0] as any).order_index || 0
                : 0;

        for (const problem of problems) {
            try {
                // Kiểm tra xem problem đã có trong contest chưa
                const existing = await this.getOne(
                    user,
                    {
                        contest_id: contestId,
                        problem_id: problem.problem_id,
                    } as any,
                    {},
                );

                if (existing) {
                    results.push({
                        problem_id: problem.problem_id,
                        success: false,
                        message: "Problem đã tồn tại trong contest",
                    });
                    failedCount++;
                    continue;
                }

                // Tính order_index - nếu không có thì tự động tăng
                const orderIndex =
                    problem.order_index !== undefined
                        ? problem.order_index
                        : currentMaxOrderIndex + 1;

                // Tạo mới
                await this.create(user, {
                    contest_id: contestId,
                    problem_id: problem.problem_id,
                    order_index: orderIndex,
                    score: problem.score ?? 100,
                    is_visible: problem.is_visible ?? true,
                } as any);

                // Cập nhật currentMaxOrderIndex nếu order_index được tự động tăng
                if (problem.order_index === undefined) {
                    currentMaxOrderIndex = orderIndex;
                }

                results.push({
                    problem_id: problem.problem_id,
                    success: true,
                    message: "Problem đã được thêm vào contest",
                });
                successCount++;
            } catch (error: any) {
                results.push({
                    problem_id: problem.problem_id,
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
