import { BaseService } from "@config/service/base.service";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { StudentSubmissionsRepository } from "../repository/student-submissions-repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import {
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";
import { User } from "@module/user/entities/user.entity";
import { Judge0Service } from "@module/judge-nodes/services/judge0.service";
import { SubmitCodeDto } from "../dto/submit-code.dto";
import { TestCasesService } from "@module/test-cases/services/test-cases.services";
import { ProblemsService } from "@module/problems/services/problems.services";
import { ApiError } from "@config/exception/api-error";

@Injectable()
export class StudentSubmissionsService extends BaseService<
    StudentSubmissions,
    StudentSubmissionsRepository
> {
    private readonly logger = new Logger(StudentSubmissionsService.name);

    constructor(
        @InjectRepository(Entity.STUDENT_SUBMISSIONS)
        private readonly studentSubmissionsRepository: StudentSubmissionsRepository,
        private readonly judge0Service: Judge0Service,
        private readonly testCasesService: TestCasesService,
        private readonly problemsService: ProblemsService,
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

    /**
     * Submit code đến Judge0 và lưu kết quả
     */
    async submitCode(
        user: User,
        dto: SubmitCodeDto,
    ): Promise<StudentSubmissions> {
        try {
            // Kiểm tra problem có tồn tại không
            const problem = await this.problemsService.getById(
                user,
                dto.problem_id,
                {},
            );
            if (!problem) {
                throw ApiError.NotFound("error-user-not-found");
            }

            // Tạo submission ID
            const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Tạo submission record
            const submission = await this.createSubmission(user, {
                submission_id: submissionId,
                student_id: user._id,
                problem_id: dto.problem_id,
                class_id: dto.class_id,
                code: dto.code,
                language: dto.language,
            });

            // Lấy test cases của problem
            const testCases = await this.testCasesService.getMany(
                user,
                { problem_id: dto.problem_id } as any,
                {},
            );

            if (testCases.length === 0) {
                throw ApiError.BadRequest("error-setting-value-invalid");
            }

            // Cập nhật total test cases
            await this.updateSubmissionResult(submissionId, {
                status: SubmissionStatus.PENDING,
                total_test_cases: testCases.length,
            });

            // Gửi submission đến Judge0 cho từng test case
            const judge0Promises = testCases.map(async (testCase, index) => {
                try {
                    const judge0Request = {
                        source_code: dto.code,
                        language_id: this.judge0Service.getLanguageId(
                            dto.language,
                        ),
                        stdin: testCase.input_data,
                        expected_output: testCase.expected_output,
                        cpu_time_limit:
                            dto.cpu_time_limit || problem.time_limit_ms / 1000,
                        memory_limit:
                            dto.memory_limit || problem.memory_limit_mb * 1024,
                        compiler_options: dto.compiler_options,
                        command_line_arguments: dto.command_line_arguments,
                    };

                    const judge0Response =
                        await this.judge0Service.submitCode(judge0Request);

                    // Lưu token Judge0
                    await this.updateSubmissionResult(submissionId, {
                        status: SubmissionStatus.RUNNING,
                        submission_token: judge0Response.token,
                    });

                    return {
                        testCase,
                        judge0Response,
                        index,
                    };
                } catch (error) {
                    this.logger.error(
                        `Error submitting test case ${index}: ${error.message}`,
                    );
                    return null;
                }
            });

            // Chờ tất cả submissions hoàn thành
            const results = await Promise.all(judge0Promises);
            const validResults = results.filter((result) => result !== null);

            if (validResults.length === 0) {
                throw ApiError.BadRequest("error-setting-value-invalid");
            }

            // Polling để lấy kết quả từ Judge0
            await this.pollJudge0Results(submissionId, validResults);

            return this.getById(user, submissionId, {});
        } catch (error) {
            this.logger.error(`Error in submitCode: ${error.message}`);
            throw error;
        }
    }

    /**
     * Polling kết quả từ Judge0
     */
    private async pollJudge0Results(
        submissionId: string,
        results: Array<{
            testCase: any;
            judge0Response: any;
            index: number;
        }>,
    ): Promise<void> {
        const maxAttempts = 30; // Tối đa 30 lần polling
        const pollInterval = 2000; // 2 giây

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let allCompleted = true;
            let testCasesPassed = 0;
            let totalExecutionTime = 0;
            let totalMemoryUsed = 0;
            let errorMessage = "";

            for (const result of results) {
                try {
                    const judge0Result =
                        await this.judge0Service.getSubmissionResult(
                            result.judge0Response.token,
                        );

                    if (
                        !this.judge0Service.isSubmissionCompleted(
                            judge0Result.status?.id || 0,
                        )
                    ) {
                        allCompleted = false;
                        continue;
                    }

                    // Xử lý kết quả test case
                    const status = this.judge0Service.getSubmissionStatus(
                        judge0Result.status?.id || 0,
                    );

                    if (status === SubmissionStatus.ACCEPTED) {
                        testCasesPassed++;
                    }

                    // Cộng dồn thời gian và bộ nhớ
                    if (judge0Result.time) {
                        totalExecutionTime +=
                            parseFloat(judge0Result.time) * 1000; // Convert to ms
                    }
                    if (judge0Result.memory) {
                        totalMemoryUsed += judge0Result.memory / 1024; // Convert to MB
                    }

                    // Lưu error message nếu có
                    if (judge0Result.stderr || judge0Result.compile_output) {
                        errorMessage += `Test case ${result.index + 1}: ${judge0Result.stderr || judge0Result.compile_output}\n`;
                    }
                } catch (error) {
                    this.logger.error(
                        `Error polling result for test case ${result.index}: ${error.message}`,
                    );
                    allCompleted = false;
                }
            }

            if (allCompleted) {
                // Tính điểm
                const score = this.judge0Service.calculateScore(
                    testCasesPassed === results.length
                        ? SubmissionStatus.ACCEPTED
                        : SubmissionStatus.WRONG_ANSWER,
                    testCasesPassed,
                    results.length,
                );

                // Cập nhật kết quả cuối cùng
                await this.updateSubmissionResult(submissionId, {
                    status:
                        testCasesPassed === results.length
                            ? SubmissionStatus.ACCEPTED
                            : SubmissionStatus.WRONG_ANSWER,
                    score,
                    execution_time_ms: Math.round(totalExecutionTime),
                    memory_used_mb: Math.round(totalMemoryUsed * 100) / 100,
                    test_cases_passed: testCasesPassed,
                    total_test_cases: results.length,
                    error_message: errorMessage.trim() || undefined,
                });

                this.logger.log(
                    `Submission ${submissionId} completed with score ${score}`,
                );
                return;
            }

            // Chờ trước khi polling tiếp
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        // Timeout - đánh dấu là internal error
        await this.updateSubmissionResult(submissionId, {
            status: SubmissionStatus.INTERNAL_ERROR,
            error_message:
                "Submission timeout - Judge0 did not respond in time",
        });

        this.logger.warn(`Submission ${submissionId} timed out`);
    }

    /**
     * Lấy kết quả submission từ Judge0 (cho manual polling)
     */
    async getSubmissionResult(
        submissionId: string,
    ): Promise<StudentSubmissions> {
        // Note: Cần User object để gọi getById, nhưng method này không có User parameter
        // Tạm thời sử dụng repository trực tiếp
        const submission = await this.studentSubmissionsRepository.getById(
            submissionId,
            {},
        );
        if (!submission) {
            throw ApiError.NotFound("error-user-not-found");
        }

        if (!submission.submission_token) {
            throw ApiError.BadRequest("error-setting-value-invalid");
        }

        try {
            const judge0Result = await this.judge0Service.getSubmissionResult(
                submission.submission_token,
            );

            if (
                this.judge0Service.isSubmissionCompleted(
                    judge0Result.status?.id || 0,
                )
            ) {
                const status = this.judge0Service.getSubmissionStatus(
                    judge0Result.status?.id || 0,
                );

                await this.updateSubmissionResult(submissionId, {
                    status,
                    execution_time_ms: judge0Result.time
                        ? parseFloat(judge0Result.time) * 1000
                        : undefined,
                    memory_used_mb: judge0Result.memory
                        ? judge0Result.memory / 1024
                        : undefined,
                    error_message:
                        judge0Result.stderr ||
                        judge0Result.compile_output ||
                        undefined,
                });

                return this.studentSubmissionsRepository.getById(
                    submissionId,
                    {},
                );
            }

            return submission;
        } catch (error) {
            this.logger.error(
                `Error getting submission result: ${error.message}`,
            );
            throw error;
        }
    }
}
