import { BaseService } from "@config/service/base.service";
import { ContestProblems } from "../entities/contest-problems.entity";
import { ContestProblemsRepository } from "../repository/contest-problems-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";

@Injectable()
export class ContestProblemsService extends BaseService<
    ContestProblems,
    ContestProblemsRepository
> {
    constructor(
        @InjectRepository(Entity.CONTEST_PROBLEMS)
        private readonly contestProblemsRepository: ContestProblemsRepository,
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
}
