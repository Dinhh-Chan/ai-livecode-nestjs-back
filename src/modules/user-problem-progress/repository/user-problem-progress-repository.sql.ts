import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { UserProblemProgressRepository } from "./user-problem-progress-repository.interface";
import { UserProblemProgress } from "../entities/user-problem-progress.entity";
import { UserProblemProgressModel } from "../models/user-problem-progress.model";
import { ModelCtor } from "sequelize-typescript";

@Injectable()
export class UserProblemProgressRepositorySql
    extends SqlRepository<UserProblemProgress>
    implements UserProblemProgressRepository
{
    constructor(
        @InjectModel(UserProblemProgressModel)
        private readonly userProblemProgressModel: ModelCtor<UserProblemProgressModel>,
        private readonly sequelize: Sequelize,
    ) {
        super(userProblemProgressModel);
    }

    async getUserProblemProgress(
        userId: string,
        problemId: string,
    ): Promise<UserProblemProgress | null> {
        return this.userProblemProgressModel.findOne({
            where: {
                user_id: userId,
                problem_id: problemId,
            },
        });
    }

    async updateProgressOnSubmission(
        userId: string,
        problemId: string,
        submissionData: any,
    ): Promise<UserProblemProgress> {
        const { status, score, timeSpent } = submissionData;

        // Tìm hoặc tạo record
        let progress = await this.getUserProblemProgress(userId, problemId);

        if (!progress) {
            progress = await this.userProblemProgressModel.create({
                user_id: userId,
                problem_id: problemId,
                is_solved: false,
                is_attempted: false,
                attempt_count: 0,
                best_score: 0,
                total_time_spent: 0,
            });
        }

        // Cập nhật thông tin
        const isSolved = status.toLowerCase() === "accepted";
        const isAttempted = true;
        const attemptCount = progress.attempt_count + 1;
        const bestScore = Math.max(progress.best_score || 0, score || 0);
        const totalTimeSpent =
            (progress.total_time_spent || 0) + (timeSpent || 0);

        const updateData: any = {
            is_attempted: isAttempted,
            attempt_count: attemptCount,
            best_score: bestScore,
            total_time_spent: totalTimeSpent,
            last_status: status,
        };

        // Nếu là lần đầu thử làm
        if (!progress.first_attempt_at) {
            updateData.first_attempt_at = new Date();
        }

        // Nếu giải được bài tập
        if (isSolved && !progress.is_solved) {
            updateData.is_solved = true;
            updateData.solved_at = new Date();
        }

        return this.userProblemProgressModel
            .update(updateData, {
                where: {
                    user_id: userId,
                    problem_id: problemId,
                },
                returning: true,
            })
            .then(([_, updatedRecords]) => updatedRecords[0]);
    }

    async getUserProgressStats(userId: string): Promise<any> {
        const stats = await this.userProblemProgressModel.findAll({
            where: { user_id: userId },
            attributes: [
                [
                    this.sequelize.fn("COUNT", this.sequelize.col("_id")),
                    "total_attempted",
                ],
                [
                    this.sequelize.fn(
                        "SUM",
                        this.sequelize.literal(
                            'CASE WHEN "_is_solved" = true THEN 1 ELSE 0 END',
                        ),
                    ),
                    "total_solved",
                ],
                [
                    this.sequelize.fn(
                        "SUM",
                        this.sequelize.col("_total_time_spent"),
                    ),
                    "total_time_spent",
                ],
            ],
            raw: true,
        });

        return {
            total_attempted: (stats[0] as any)?.total_attempted || 0,
            total_solved: (stats[0] as any)?.total_solved || 0,
            total_time_spent: (stats[0] as any)?.total_time_spent || 0,
        };
    }

    async getSolvedProblemsByDifficulty(
        userId: string,
        difficulty?: number,
    ): Promise<UserProblemProgress[]> {
        const whereCondition: any = {
            user_id: userId,
            is_solved: true,
        };

        if (difficulty) {
            whereCondition["$problem.difficulty$"] = difficulty;
        }

        return this.userProblemProgressModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: this.sequelize.models.ProblemsModel,
                    as: "problem",
                },
            ],
        });
    }
}
