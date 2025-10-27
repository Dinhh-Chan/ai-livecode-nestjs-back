import { BaseService } from "@config/service/base.service";
import { UserProblemProgress } from "../entities/user-problem-progress.entity";
import { UserProblemProgressRepository } from "../repository/user-problem-progress-repository.interface";
import { Injectable, Logger, Inject } from "@nestjs/common";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import {
    CreateUserProblemProgressDto,
    UpdateUserProblemProgressDto,
    UserProgressSummaryDto,
    UserProgressStatsDto,
    ProblemStatusDto,
    UpdateProgressDto,
    UserProblemProgressDto,
} from "../dto";

export const USER_PROBLEM_PROGRESS_REPOSITORY_TOKEN = Symbol(
    "USER_PROBLEM_PROGRESS_REPOSITORY",
);

@Injectable()
export class UserProblemProgressService extends BaseService<
    UserProblemProgress,
    UserProblemProgressRepository
> {
    private readonly logger = new Logger(UserProblemProgressService.name);

    constructor(
        @Inject(USER_PROBLEM_PROGRESS_REPOSITORY_TOKEN)
        private readonly userProblemProgressRepository: UserProblemProgressRepository,
    ) {
        super(userProblemProgressRepository);
    }

    /**
     * Lấy tổng quan tiến độ của user
     */
    async getUserProgressSummary(
        userId: string,
    ): Promise<UserProgressSummaryDto> {
        const stats =
            await this.userProblemProgressRepository.getUserProgressStats(
                userId,
            );

        const solveRate =
            stats.total_attempted > 0
                ? Math.round((stats.total_solved / stats.total_attempted) * 100)
                : 0;

        return {
            total_attempted: stats.total_attempted,
            total_solved: stats.total_solved,
            solve_rate: solveRate,
            total_time_spent: stats.total_time_spent,
        };
    }

    /**
     * Lấy thống kê chi tiết tiến độ của user
     */
    async getUserProgressStats(userId: string): Promise<UserProgressStatsDto> {
        const stats =
            await this.userProblemProgressRepository.getUserProgressStats(
                userId,
            );

        const solveRate =
            stats.total_attempted > 0
                ? Math.round((stats.total_solved / stats.total_attempted) * 100)
                : 0;

        // Lấy số bài giải được theo độ khó
        const solvedByDifficulty =
            await this.userProblemProgressRepository.getSolvedProblemsByDifficulty(
                userId,
            );
        const difficultyStats: { [key: number]: number } = {};

        solvedByDifficulty.forEach((progress) => {
            if (progress.problem?.difficulty) {
                difficultyStats[progress.problem.difficulty] =
                    (difficultyStats[progress.problem.difficulty] || 0) + 1;
            }
        });

        return {
            total_attempted: stats.total_attempted,
            total_solved: stats.total_solved,
            solve_rate: solveRate,
            total_time_spent: stats.total_time_spent,
            solved_by_difficulty: difficultyStats,
        };
    }

    /**
     * Lấy tiến độ của user với một problem cụ thể
     */
    async getUserProblemProgress(
        userId: string,
        problemId: string,
    ): Promise<ProblemStatusDto | null> {
        const progress =
            await this.userProblemProgressRepository.getUserProblemProgress(
                userId,
                problemId,
            );

        if (!progress) {
            return null;
        }

        return {
            is_solved: progress.is_solved,
            is_attempted: progress.is_attempted,
            attempt_count: progress.attempt_count,
            best_score: progress.best_score || 0,
            last_status: progress.last_status,
        };
    }

    /**
     * Kiểm tra user đã giải được bài tập chưa
     */
    async isProblemSolved(userId: string, problemId: string): Promise<boolean> {
        const progress =
            await this.userProblemProgressRepository.getUserProblemProgress(
                userId,
                problemId,
            );
        return progress?.is_solved || false;
    }

    /**
     * Kiểm tra user đã thử làm bài tập chưa
     */
    async isProblemAttempted(
        userId: string,
        problemId: string,
    ): Promise<boolean> {
        const progress =
            await this.userProblemProgressRepository.getUserProblemProgress(
                userId,
                problemId,
            );
        return progress?.is_attempted || false;
    }

    /**
     * Lấy danh sách bài tập đã giải được
     */
    async getSolvedProblems(userId: string): Promise<UserProblemProgressDto[]> {
        return this.getMany(
            {} as any, // user
            { user_id: userId, is_solved: true } as any,
            { population: [{ path: "problem" }] },
        );
    }

    /**
     * Lấy danh sách bài tập đã thử làm
     */
    async getAttemptedProblems(
        userId: string,
    ): Promise<UserProblemProgressDto[]> {
        return this.getMany(
            {} as any, // user
            { user_id: userId, is_attempted: true } as any,
            { population: [{ path: "problem" }] },
        );
    }

    /**
     * Lấy danh sách bài tập đã thử nhưng chưa giải được
     */
    async getUnsolvedAttemptedProblems(
        userId: string,
    ): Promise<UserProblemProgressDto[]> {
        return this.getMany(
            {} as any, // user
            { user_id: userId, is_attempted: true, is_solved: false } as any,
            { population: [{ path: "problem" }] },
        );
    }

    /**
     * Cập nhật tiến độ khi có submission mới
     */
    async updateProgressOnSubmission(
        userId: string,
        dto: UpdateProgressDto,
    ): Promise<UserProblemProgressDto> {
        this.logger.log(
            `Updating progress for user ${userId}, problem ${dto.problem_id}, status: ${dto.status}`,
        );

        const progress =
            await this.userProblemProgressRepository.updateProgressOnSubmission(
                userId,
                dto.problem_id,
                {
                    status: dto.status,
                    score: dto.score,
                    timeSpent: dto.time_spent,
                },
            );

        return progress as UserProblemProgressDto;
    }

    /**
     * Cập nhật thời gian làm bài
     */
    async updateTimeSpent(
        userId: string,
        problemId: string,
        timeSpent: number,
    ): Promise<void> {
        const progress =
            await this.userProblemProgressRepository.getUserProblemProgress(
                userId,
                problemId,
            );

        if (progress) {
            await this.updateById(
                {} as any, // user
                progress._id,
                {
                    total_time_spent:
                        (progress.total_time_spent || 0) + timeSpent,
                } as any,
            );
        }
    }

    /**
     * Cập nhật tiến độ từ kết quả judge bên ngoài
     */
    async updateUserProgressFromJudgeResult(
        userId: string,
        problemId: string,
        status: string,
        score?: number,
        timeSpent?: number,
    ): Promise<UserProblemProgressDto> {
        return this.updateProgressOnSubmission(userId, {
            problem_id: problemId,
            status,
            score,
            time_spent: timeSpent,
        });
    }
}
