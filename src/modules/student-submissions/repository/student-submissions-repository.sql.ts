import { InjectModel } from "@nestjs/sequelize";
import { StudentSubmissionsModel } from "../models/student-submissions.models";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { StudentSubmissionsRepository } from "./student-submissions-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import {
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";

export class StudentSubmissionsRepositorySql
    extends SqlRepository<StudentSubmissions>
    implements StudentSubmissionsRepository
{
    constructor(
        @InjectModel(StudentSubmissionsModel)
        private readonly studentSubmissionsModel: typeof StudentSubmissionsModel,
    ) {
        super(studentSubmissionsModel);
    }

    async findByStudentId(
        studentId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { student_id: studentId },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async findByProblemId(
        problemId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { problem_id: problemId },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async findByClassId(
        classId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { class_id: classId },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async findByStatus(
        status: SubmissionStatus,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { status },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async findByJudgeNodeId(
        judgeNodeId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { judge_node_id: judgeNodeId },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async findByStudentAndProblem(
        studentId: string,
        problemId: string,
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: {
                student_id: studentId,
                problem_id: problemId,
            },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }

    async getStudentSubmissionStats(studentId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        lastSubmission: Date | null;
    }> {
        const { Op } = await import("sequelize");

        // Đếm tổng số submissions
        const totalSubmissions = await this.studentSubmissionsModel.count({
            where: { student_id: studentId },
        });

        // Đếm submissions đã accept
        const acceptedSubmissions = await this.studentSubmissionsModel.count({
            where: {
                student_id: studentId,
                status: SubmissionStatus.ACCEPTED,
            },
        });

        // Đếm theo từng status
        const statusCounts = await this.studentSubmissionsModel.findAll({
            attributes: [
                "status",
                [
                    this.studentSubmissionsModel.sequelize.fn("COUNT", "*"),
                    "count",
                ],
            ],
            where: { student_id: studentId },
            group: ["status"],
            raw: true,
        });

        // Tính điểm trung bình
        const avgScore = await this.studentSubmissionsModel.findOne({
            attributes: [
                [
                    this.studentSubmissionsModel.sequelize.fn(
                        "AVG",
                        this.studentSubmissionsModel.sequelize.col("score"),
                    ),
                    "avg_score",
                ],
            ],
            where: { student_id: studentId },
            raw: true,
        });

        // Lấy submission cuối cùng
        const lastSubmission = await this.studentSubmissionsModel.findOne({
            where: { student_id: studentId },
            order: [["submitted_at", "DESC"]],
        });

        // Chuyển đổi kết quả statusCounts
        const statusCountsRecord: Record<string, number> = {};
        statusCounts.forEach((item: any) => {
            statusCountsRecord[item.status] = parseInt(item.count);
        });

        return {
            totalSubmissions,
            acceptedSubmissions,
            statusCounts: statusCountsRecord,
            averageScore: parseFloat((avgScore as any)?.avg_score) || 0,
            lastSubmission: lastSubmission?.submitted_at || null,
        };
    }

    async getProblemSubmissionStats(problemId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        languageCounts: Record<string, number>;
    }> {
        const { Op } = await import("sequelize");

        // Đếm tổng số submissions
        const totalSubmissions = await this.studentSubmissionsModel.count({
            where: { problem_id: problemId },
        });

        // Đếm submissions đã accept
        const acceptedSubmissions = await this.studentSubmissionsModel.count({
            where: {
                problem_id: problemId,
                status: SubmissionStatus.ACCEPTED,
            },
        });

        // Đếm theo từng status
        const statusCounts = await this.studentSubmissionsModel.findAll({
            attributes: [
                "status",
                [
                    this.studentSubmissionsModel.sequelize.fn("COUNT", "*"),
                    "count",
                ],
            ],
            where: { problem_id: problemId },
            group: ["status"],
            raw: true,
        });

        // Đếm theo từng language
        const languageCounts = await this.studentSubmissionsModel.findAll({
            attributes: [
                "language",
                [
                    this.studentSubmissionsModel.sequelize.fn("COUNT", "*"),
                    "count",
                ],
            ],
            where: { problem_id: problemId },
            group: ["language"],
            raw: true,
        });

        // Tính điểm trung bình
        const avgScore = await this.studentSubmissionsModel.findOne({
            attributes: [
                [
                    this.studentSubmissionsModel.sequelize.fn(
                        "AVG",
                        this.studentSubmissionsModel.sequelize.col("score"),
                    ),
                    "avg_score",
                ],
            ],
            where: { problem_id: problemId },
            raw: true,
        });

        // Chuyển đổi kết quả
        const statusCountsRecord: Record<string, number> = {};
        statusCounts.forEach((item: any) => {
            statusCountsRecord[item.status] = parseInt(item.count);
        });

        const languageCountsRecord: Record<string, number> = {};
        languageCounts.forEach((item: any) => {
            languageCountsRecord[item.language] = parseInt(item.count);
        });

        return {
            totalSubmissions,
            acceptedSubmissions,
            statusCounts: statusCountsRecord,
            averageScore: parseFloat((avgScore as any)?.avg_score) || 0,
            languageCounts: languageCountsRecord,
        };
    }

    async getPendingSubmissions(
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { status: SubmissionStatus.PENDING },
            order: [["submitted_at", "ASC"]],
            limit,
        });
    }

    async getRunningSubmissions(
        limit: number = 100,
    ): Promise<StudentSubmissions[]> {
        return this.studentSubmissionsModel.findAll({
            where: { status: SubmissionStatus.RUNNING },
            order: [["submitted_at", "ASC"]],
            limit,
        });
    }

    async updateSubmissionStatus(
        submissionId: string,
        status: SubmissionStatus,
        additionalData?: any,
    ): Promise<StudentSubmissions> {
        const updateData: any = { status };

        if (additionalData) {
            Object.assign(updateData, additionalData);
        }

        if (
            status === SubmissionStatus.ACCEPTED ||
            status === SubmissionStatus.WRONG_ANSWER ||
            status === SubmissionStatus.TIME_LIMIT_EXCEEDED ||
            status === SubmissionStatus.MEMORY_LIMIT_EXCEEDED ||
            status === SubmissionStatus.RUNTIME_ERROR ||
            status === SubmissionStatus.COMPILE_ERROR ||
            status === SubmissionStatus.INTERNAL_ERROR
        ) {
            updateData.judged_at = new Date();
        }

        const [affectedCount] = await this.studentSubmissionsModel.update(
            updateData,
            {
                where: { submission_id: submissionId },
            },
        );

        if (affectedCount === 0) {
            throw new Error(`Submission ${submissionId} not found`);
        }

        return this.studentSubmissionsModel.findOne({
            where: { submission_id: submissionId },
        });
    }

    async getSubmissionsByTimeRange(
        startDate: Date,
        endDate: Date,
        limit: number = 1000,
    ): Promise<StudentSubmissions[]> {
        const { Op } = await import("sequelize");

        return this.studentSubmissionsModel.findAll({
            where: {
                submitted_at: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            order: [["submitted_at", "DESC"]],
            limit,
        });
    }
}
