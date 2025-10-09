import { BaseService } from "@config/service/base.service";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { StudentSubmissionsRepository } from "../repository/student-submissions-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import {
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class StudentSubmissionsService extends BaseService<
    StudentSubmissions,
    StudentSubmissionsRepository
> {
    constructor(
        @InjectRepository(Entity.STUDENT_SUBMISSIONS)
        private readonly studentSubmissionsRepository: StudentSubmissionsRepository,
    ) {
        super(studentSubmissionsRepository);
    }

    /**
     * Lấy submissions theo student ID
     */
    async getSubmissionsByStudent(
        studentId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByStudentId(
            studentId,
            limit,
        );
    }

    /**
     * Lấy submissions theo problem ID
     */
    async getSubmissionsByProblem(
        problemId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByProblemId(
            problemId,
            limit,
        );
    }

    /**
     * Lấy submissions theo class ID
     */
    async getSubmissionsByClass(
        classId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByClassId(classId, limit);
    }

    /**
     * Lấy submissions theo status
     */
    async getSubmissionsByStatus(
        status: SubmissionStatus,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByStatus(status, limit);
    }

    /**
     * Lấy submissions theo judge node ID
     */
    async getSubmissionsByJudgeNode(
        judgeNodeId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByJudgeNodeId(
            judgeNodeId,
            limit,
        );
    }

    /**
     * Lấy submissions của student cho một problem cụ thể
     */
    async getStudentProblemSubmissions(
        studentId: string,
        problemId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.findByStudentAndProblem(
            studentId,
            problemId,
            limit,
        );
    }

    /**
     * Lấy thống kê submissions của student
     */
    async getStudentSubmissionStats(studentId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        lastSubmission: Date | null;
    }> {
        return this.studentSubmissionsRepository.getStudentSubmissionStats(
            studentId,
        );
    }

    /**
     * Lấy thống kê submissions của problem
     */
    async getProblemSubmissionStats(problemId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        languageCounts: Record<string, number>;
    }> {
        return this.studentSubmissionsRepository.getProblemSubmissionStats(
            problemId,
        );
    }

    /**
     * Lấy submissions đang chờ chấm
     */
    async getPendingSubmissions(
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.getPendingSubmissions(limit);
    }

    /**
     * Lấy submissions đang được chấm
     */
    async getRunningSubmissions(
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.getRunningSubmissions(limit);
    }

    /**
     * Cập nhật trạng thái submission
     */
    async updateSubmissionStatus(
        submissionId: string,
        status: SubmissionStatus,
        additionalData?: any,
    ): Promise<StudentSubmissions> {
        return this.studentSubmissionsRepository.updateSubmissionStatus(
            submissionId,
            status,
            additionalData,
        );
    }

    /**
     * Lấy submissions trong khoảng thời gian
     */
    async getSubmissionsByTimeRange(
        startDate: Date,
        endDate: Date,
        limit: number = 1000,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.getSubmissionsByTimeRange(
            startDate,
            endDate,
            limit,
        );
    }

    /**
     * Tạo submission mới
     */
    async createSubmission(
        user: User,
        submissionData: {
            submission_id: string;
            student_id: string;
            problem_id: string;
            class_id?: string;
            code: string;
            language: ProgrammingLanguage;
        },
    ): Promise<StudentSubmissions> {
        const submission: Partial<StudentSubmissions> = {
            ...submissionData,
            status: SubmissionStatus.PENDING,
            submitted_at: new Date(),
            score: 0,
            execution_time_ms: 0,
            memory_used_mb: 0,
            test_cases_passed: 0,
            total_test_cases: 0,
        };

        return this.studentSubmissionsRepository.create(submission);
    }

    /**
     * Gán submission cho judge node
     */
    async assignSubmissionToNode(
        submissionId: string,
        judgeNodeId: string,
    ): Promise<StudentSubmissions> {
        return this.studentSubmissionsRepository.updateSubmissionStatus(
            submissionId,
            SubmissionStatus.RUNNING,
            { judge_node_id: judgeNodeId },
        );
    }

    /**
     * Cập nhật kết quả chấm bài
     */
    async updateSubmissionResult(
        submissionId: string,
        result: {
            status: SubmissionStatus;
            score?: number;
            execution_time_ms?: number;
            memory_used_mb?: number;
            test_cases_passed?: number;
            total_test_cases?: number;
            error_message?: string;
            submission_token?: string;
        },
    ): Promise<StudentSubmissions> {
        return this.studentSubmissionsRepository.updateSubmissionStatus(
            submissionId,
            result.status,
            result,
        );
    }

    /**
     * Lấy submissions của student trong class
     */
    async getStudentClassSubmissions(
        studentId: string,
        classId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        const submissions = await this.studentSubmissionsRepository.getMany(
            { student_id: studentId, class_id: classId },
            {},
        );
        return submissions;
    }

    /**
     * Lấy submissions của class cho một problem
     */
    async getClassProblemSubmissions(
        classId: string,
        problemId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        const submissions = await this.studentSubmissionsRepository.getMany(
            { class_id: classId, problem_id: problemId },
            {},
        );
        return submissions;
    }

    /**
     * Lấy submission cuối cùng của student cho problem
     */
    async getLastSubmission(
        studentId: string,
        problemId: string,
    ): Promise<StudentSubmissions | null> {
        const submissions =
            await this.studentSubmissionsRepository.findByStudentAndProblem(
                studentId,
                problemId,
                1,
            );
        return submissions.length > 0 ? submissions[0] : null;
    }

    /**
     * Kiểm tra student đã submit problem chưa
     */
    async hasStudentSubmitted(
        studentId: string,
        problemId: string,
    ): Promise<boolean> {
        const count = await this.studentSubmissionsRepository.count({
            student_id: studentId,
            problem_id: problemId,
        });
        return count > 0;
    }

    /**
     * Lấy submissions đã accept của student
     */
    async getAcceptedSubmissions(
        studentId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsRepository.getMany(
            { student_id: studentId, status: SubmissionStatus.ACCEPTED },
            {},
        );
    }

    /**
     * Lấy submissions có lỗi của student
     */
    async getErrorSubmissions(
        studentId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        const errorStatuses = [
            SubmissionStatus.WRONG_ANSWER,
            SubmissionStatus.TIME_LIMIT_EXCEEDED,
            SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
            SubmissionStatus.RUNTIME_ERROR,
            SubmissionStatus.COMPILE_ERROR,
            SubmissionStatus.INTERNAL_ERROR,
        ];

        const submissions = await this.studentSubmissionsRepository.getMany(
            { student_id: studentId },
            {},
        );

        return submissions.filter((sub) => errorStatuses.includes(sub.status));
    }

    /**
     * Tính điểm trung bình của student
     */
    async calculateStudentAverageScore(studentId: string): Promise<number> {
        const stats = await this.getStudentSubmissionStats(studentId);
        return stats.averageScore;
    }

    /**
     * Lấy top submissions theo điểm số
     */
    async getTopSubmissions(
        problemId: string,
        limit: number = 10,
    ): Promise<StudentSubmissions[]> {
        const submissions = await this.studentSubmissionsRepository.getMany(
            { problem_id: problemId },
            {},
        );

        return submissions
            .filter((sub) => sub.status === SubmissionStatus.ACCEPTED)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, limit);
    }

    /**
     * Lấy thống kê submissions theo ngày
     */
    async getDailySubmissionStats(days: number = 7): Promise<
        {
            date: string;
            totalSubmissions: number;
            statusCounts: Record<string, number>;
            languageCounts: Record<string, number>;
        }[]
    > {
        const { Op } = await import("sequelize");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const submissions = await this.studentSubmissionsRepository.getMany(
            {
                submitted_at: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            {},
        );

        // Nhóm submissions theo ngày
        const dailyStats: Record<string, any> = {};

        submissions.forEach((submission) => {
            const date = new Date((submission as any).submitted_at)
                .toISOString()
                .split("T")[0];

            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date,
                    totalSubmissions: 0,
                    statusCounts: {},
                    languageCounts: {},
                };
            }

            dailyStats[date].totalSubmissions++;

            // Đếm theo status
            if (!dailyStats[date].statusCounts[submission.status]) {
                dailyStats[date].statusCounts[submission.status] = 0;
            }
            dailyStats[date].statusCounts[submission.status]++;

            // Đếm theo language
            if (!dailyStats[date].languageCounts[submission.language]) {
                dailyStats[date].languageCounts[submission.language] = 0;
            }
            dailyStats[date].languageCounts[submission.language]++;
        });

        return Object.values(dailyStats).sort((a, b) =>
            a.date.localeCompare(b.date),
        );
    }
}
