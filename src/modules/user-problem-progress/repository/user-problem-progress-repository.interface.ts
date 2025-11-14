import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { UserProblemProgress } from "../entities/user-problem-progress.entity";

export interface UserProblemProgressRepository
    extends BaseRepository<UserProblemProgress> {
    /**
     * Lấy tiến độ của user với một problem cụ thể
     */
    getUserProblemProgress(
        userId: string,
        problemId: string,
    ): Promise<UserProblemProgress | null>;

    /**
     * Cập nhật tiến độ khi có submission mới
     */
    updateProgressOnSubmission(
        userId: string,
        problemId: string,
        submissionData: any,
    ): Promise<UserProblemProgress>;

    /**
     * Lấy thống kê tiến độ của user
     */
    getUserProgressStats(userId: string): Promise<any>;

    /**
     * Lấy danh sách bài tập đã giải được theo độ khó
     */
    getSolvedProblemsByDifficulty(
        userId: string,
        difficulty?: number,
    ): Promise<UserProblemProgress[]>;

    /**
     * Đếm số bài đã giải của user theo sub topic
     */
    countSolvedBySubTopic(userId: string, subTopicId: string): Promise<number>;
}
