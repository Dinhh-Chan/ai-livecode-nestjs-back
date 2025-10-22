import { BaseService } from "@config/service/base.service";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { StudentSubmissionsRepository } from "../repository/student-submissions-repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { SubmissionStatus } from "../entities/student-submissions.entity";
import { User } from "@module/user/entities/user.entity";
import { Judge0Service } from "@module/judge-nodes/services/judge0.service";
import { SubmitCodeDto } from "../dto/submit-code.dto";
import { TestCasesService } from "@module/test-cases/services/test-cases.services";
import { ProblemsService } from "@module/problems/services/problems.services";
import { ApiError } from "@config/exception/api-error";
import {
    RankingRecord,
    RankingResponse,
    UserRecord,
} from "../interfaces/ranking.interface";

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
     * Lấy submissions theo student ID với thông tin user và problem
     */
    async getSubmissionsByStudent(
        user: User,
        studentId: string,
        limit: number = 100,
    ): Promise<any[]> {
        const submissions =
            await this.studentSubmissionsRepository.findByStudentId(
                studentId,
                limit,
            );

        // Làm giàu từng submission với thông tin user và problem
        const enrichedSubmissions = await Promise.all(
            submissions.map(async (submission) => {
                return await this.enrichSubmissionWithDetails(submission, user);
            }),
        );

        // Lấy thông tin user để thêm vào cuối response
        const userInfo = await this.getUserById(studentId);
        const userData = userInfo
            ? {
                  _id: userInfo._id,
                  username: userInfo.username,
                  email: userInfo.email,
                  fullname: userInfo.fullname,
                  systemRole: userInfo.systemRole,
              }
            : undefined;

        return {
            submissions: enrichedSubmissions,
            user: userData,
        } as any;
    }

    /**
     * Lấy submissions theo problem ID với thông tin user và problem
     */
    async getSubmissionsByProblem(
        user: User,
        problemId: string,
        limit: number = 100,
    ): Promise<any[]> {
        const submissions =
            await this.studentSubmissionsRepository.findByProblemId(
                problemId,
                limit,
            );

        // Làm giàu từng submission với thông tin user và problem
        const enrichedSubmissions = await Promise.all(
            submissions.map(async (submission) => {
                return await this.enrichSubmissionWithDetails(submission, user);
            }),
        );

        return enrichedSubmissions;
    }

    /**
     * Lấy submissions theo class ID với thông tin user và problem
     */
    async getSubmissionsByClass(
        user: User,
        classId: string,
        limit: number = 100,
    ): Promise<any[]> {
        const submissions =
            await this.studentSubmissionsRepository.findByClassId(
                classId,
                limit,
            );

        // Làm giàu từng submission với thông tin user và problem
        const enrichedSubmissions = await Promise.all(
            submissions.map(async (submission) => {
                return await this.enrichSubmissionWithDetails(submission, user);
            }),
        );

        return enrichedSubmissions;
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
            language_id: number;
            judge_node_id?: string;
        },
    ): Promise<StudentSubmissions> {
        this.logger.log(
            `Creating submission with data: ${JSON.stringify(submissionData)}`,
        );

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

        this.logger.log(
            `Submission object to create: ${JSON.stringify(submission)}`,
        );

        try {
            const result =
                await this.studentSubmissionsRepository.create(submission);
            this.logger.log(
                `Submission created successfully: ${JSON.stringify(result)}`,
            );
            return result;
        } catch (error) {
            this.logger.error(`Error creating submission: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
            throw error;
        }
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

            // Đếm theo language_id
            const languageKey = `language_${submission.language_id}`;
            if (!dailyStats[date].languageCounts[languageKey]) {
                dailyStats[date].languageCounts[languageKey] = 0;
            }
            dailyStats[date].languageCounts[languageKey]++;
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
            this.logger.log(`Creating submission with ID: ${submissionId}`);
            this.logger.log(`User ID: ${user._id}`);
            this.logger.log(`Problem ID: ${dto.problem_id}`);
            this.logger.log(`Language ID: ${dto.language_id}`);
            this.logger.log(`Code length: ${dto.code.length} characters`);

            // Tạo judge_node_id giả lập (có thể thay thế bằng logic chọn judge node thực tế)
            const judgeNodeId = `judge_node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Assigning judge node ID: ${judgeNodeId}`);

            const submission = await this.createSubmission(user, {
                submission_id: submissionId,
                student_id: user._id,
                problem_id: dto.problem_id,
                class_id: dto.class_id,
                code: dto.code,
                language_id: dto.language_id,
                judge_node_id: judgeNodeId,
            });

            this.logger.log(
                `Submission created successfully with ID: ${submission._id}`,
            );
            this.logger.log(
                `Submission submission_id: ${submission.submission_id}`,
            );
            this.logger.log(`Submission status: ${submission.status}`);

            // Lấy test cases của problem
            this.logger.log(
                `Getting test cases for problem: ${dto.problem_id}`,
            );
            const testCases = await this.testCasesService.getMany(
                user,
                { problem_id: dto.problem_id } as any,
                {},
            );
            this.logger.log(`Found ${testCases.length} test cases`);

            if (testCases.length === 0) {
                this.logger.error(
                    `No test cases found for problem: ${dto.problem_id}`,
                );
                throw ApiError.BadRequest("error-setting-value-invalid");
            }

            // Cập nhật total test cases
            await this.updateSubmissionResult(submissionId, {
                status: SubmissionStatus.PENDING,
                total_test_cases: testCases.length,
            });

            // Gửi submission đến Judge0 cho từng test case
            this.logger.log(
                `Sending submission to Judge0 for ${testCases.length} test cases`,
            );

            try {
                // Kiểm tra Judge0 service có hoạt động không
                const judge0Config = await this.judge0Service
                    .getConfiguration()
                    .catch((error) => {
                        this.logger.error(
                            `Error connecting to Judge0: ${error.message}`,
                        );
                        return null;
                    });

                if (!judge0Config) {
                    this.logger.error(`Judge0 service is not available`);
                    // Cập nhật submission status
                    await this.updateSubmissionResult(submissionId, {
                        status: SubmissionStatus.INTERNAL_ERROR,
                        error_message: "Judge0 service is not available",
                    });

                    // Trả về submission đã tạo
                    return this.studentSubmissionsRepository.getById(
                        submissionId,
                        {},
                    );
                }

                this.logger.log(`Judge0 service is available`);
            } catch (error) {
                this.logger.error(
                    `Error checking Judge0 service: ${error.message}`,
                );
            }

            const judge0Promises = testCases.map(async (testCase, index) => {
                try {
                    const judge0Request = {
                        source_code: dto.code,
                        language_id: dto.language_id,
                        stdin: testCase.input_data,
                        expected_output: testCase.expected_output,
                        cpu_time_limit:
                            dto.cpu_time_limit || problem.time_limit_ms / 1000,
                        memory_limit:
                            dto.memory_limit || problem.memory_limit_mb * 1024,
                        compiler_options: dto.compiler_options,
                        command_line_arguments: dto.command_line_arguments,
                    };

                    this.logger.log(
                        `Submitting test case ${index + 1}/${testCases.length} to Judge0`,
                    );
                    const judge0Response =
                        await this.judge0Service.submitCode(judge0Request);
                    this.logger.log(
                        `Test case ${index + 1} submitted successfully, token: ${judge0Response.token}`,
                    );

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
                this.logger.error(`No valid Judge0 responses received`);
                // Cập nhật submission status
                await this.updateSubmissionResult(submissionId, {
                    status: SubmissionStatus.INTERNAL_ERROR,
                    error_message: "Failed to submit code to Judge0",
                });

                // Trả về submission đã tạo
                return this.studentSubmissionsRepository.getById(
                    submissionId,
                    {},
                );
            }

            this.logger.log(
                `Received ${validResults.length}/${testCases.length} valid Judge0 responses`,
            );

            // Polling để lấy kết quả từ Judge0
            await this.pollJudge0Results(submissionId, validResults);

            // Lấy submission đã được tạo trực tiếp từ repository
            this.logger.log(
                `Getting submission ${submissionId} after processing`,
            );

            // Thử lấy bằng submission_id trước
            let finalSubmission =
                await this.studentSubmissionsRepository.getOne(
                    { submission_id: submissionId },
                    {},
                );

            if (!finalSubmission) {
                this.logger.error(
                    `Submission not found by submission_id: ${submissionId}`,
                );

                // Thử lấy bằng _id nếu có
                if (submission && submission._id) {
                    this.logger.log(
                        `Trying to get submission by _id: ${submission._id}`,
                    );
                    finalSubmission =
                        await this.studentSubmissionsRepository.getById(
                            submission._id,
                            {},
                        );
                }
            }

            if (!finalSubmission) {
                this.logger.error(
                    `Submission ${submissionId} not found after creation`,
                );
                this.logger.error(
                    `Original submission object: ${JSON.stringify(submission)}`,
                );
                throw ApiError.BadRequest("error-setting-value-invalid");
            }

            this.logger.log(`Final submission found: ${finalSubmission._id}`);

            // Lấy thông tin user và problem để thêm vào response
            const submissionWithDetails =
                await this.enrichSubmissionWithDetails(finalSubmission, user);

            this.logger.log(`Submission ${submissionId} created successfully`);
            return submissionWithDetails;
        } catch (error) {
            this.logger.error(`Error in submitCode: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
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
        user: User,
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

                const updatedSubmission =
                    await this.studentSubmissionsRepository.getById(
                        submissionId,
                        {},
                    );

                // Làm giàu submission với thông tin user và problem
                return await this.enrichSubmissionWithDetails(
                    updatedSubmission,
                    user,
                );
            }

            // Làm giàu submission với thông tin user và problem
            return await this.enrichSubmissionWithDetails(submission, user);
        } catch (error) {
            this.logger.error(
                `Error getting submission result: ${error.message}`,
            );
            throw error;
        }
    }

    /**
     * Lấy bảng xếp hạng theo số bài đã giải
     */
    async getRanking(
        user: User,
        limit: number = 100,
        includeCurrentUser: boolean = true,
    ): Promise<RankingResponse> {
        try {
            this.logger.log(`Getting ranking with limit: ${limit}`);

            // Lấy tất cả submissions đã accept
            const acceptedSubmissions =
                await this.studentSubmissionsRepository.getMany(
                    { status: SubmissionStatus.ACCEPTED },
                    {},
                );

            // Đếm số bài đã giải của mỗi user
            const userProblemCounts = new Map<string, Set<string>>();

            acceptedSubmissions.forEach((submission) => {
                const userId = submission.student_id;
                const problemId = submission.problem_id;

                if (!userProblemCounts.has(userId)) {
                    userProblemCounts.set(userId, new Set());
                }
                userProblemCounts.get(userId)!.add(problemId);
            });

            // Tạo danh sách ranking
            const rankingData: Array<{
                userId: string;
                totalProblemsSolved: number;
            }> = [];

            userProblemCounts.forEach((problemIds, userId) => {
                rankingData.push({
                    userId,
                    totalProblemsSolved: problemIds.size,
                });
            });

            // Sắp xếp theo số bài đã giải (giảm dần)
            rankingData.sort(
                (a, b) => b.totalProblemsSolved - a.totalProblemsSolved,
            );

            // Lấy thông tin user cho top rankings
            const topRankings: RankingRecord[] = [];
            const userIds = rankingData
                .slice(0, limit)
                .map((item) => item.userId);

            // Lấy thông tin user từ database (giả sử có UserService)
            // Trong thực tế, bạn cần inject UserService hoặc UserRepository
            const users = await this.getUsersByIds(userIds);
            const userMap = new Map(users.map((u) => [u._id, u]));

            rankingData.slice(0, limit).forEach((item, index) => {
                const userData = userMap.get(item.userId);
                if (userData) {
                    topRankings.push({
                        rankNumber: index + 1,
                        user: this.mapUserToRecord(userData),
                        totalProblemsSolved: item.totalProblemsSolved,
                    });
                }
            });

            // Tìm thứ hạng của user hiện tại
            let currentUserRank: RankingRecord | undefined;
            if (includeCurrentUser) {
                const currentUserIndex = rankingData.findIndex(
                    (item) => item.userId === user._id,
                );

                if (currentUserIndex !== -1) {
                    const currentUser = await this.getUserById(user._id);
                    if (currentUser) {
                        currentUserRank = {
                            rankNumber: currentUserIndex + 1,
                            user: this.mapUserToRecord(currentUser),
                            totalProblemsSolved:
                                rankingData[currentUserIndex]
                                    .totalProblemsSolved,
                        };
                    }
                }
            }

            this.logger.log(
                `Ranking generated with ${topRankings.length} users`,
            );

            return {
                rankings: topRankings,
                totalUsers: rankingData.length,
                currentUserRank,
            };
        } catch (error) {
            this.logger.error(`Error getting ranking: ${error.message}`);
            throw error;
        }
    }

    /**
     * Lấy thông tin user theo IDs (placeholder - cần implement)
     */
    private async getUsersByIds(userIds: string[]): Promise<User[]> {
        // TODO: Implement this method using UserService or UserRepository
        // Trong thực tế, bạn cần inject UserService và gọi method tương ứng
        this.logger.log(`Getting users by IDs: ${userIds.join(", ")}`);

        // Placeholder - trả về empty array
        // Bạn cần thay thế bằng implementation thực tế
        return [];
    }

    /**
     * Lấy thông tin user theo ID (placeholder - cần implement)
     */
    private async getUserById(userId: string): Promise<User | null> {
        // TODO: Implement this method using UserService or UserRepository
        this.logger.log(`Getting user by ID: ${userId}`);

        // Placeholder - trả về null
        // Bạn cần thay thế bằng implementation thực tế
        return null;
    }

    /**
     * Map User entity sang UserRecord
     */
    private mapUserToRecord(user: User): UserRecord {
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullname, // Sửa từ fullName thành fullname
            avatar: undefined, // User entity không có avatar field
            systemRole: user.systemRole,
            createdAt: new Date(), // User entity không có createdAt field, sử dụng new Date()
            updatedAt: new Date(), // User entity không có updatedAt field, sử dụng new Date()
        };
    }

    /**
     * Làm giàu submission với thông tin user và problem
     */
    private async enrichSubmissionWithDetails(
        submission: StudentSubmissions,
        currentUser: User,
    ): Promise<any> {
        try {
            this.logger.log(
                `Enriching submission ${submission._id} with user and problem details`,
            );

            // Lấy thông tin user (có thể khác với currentUser nếu là admin xem submission của student khác)
            const submissionUser = await this.getUserById(
                submission.student_id,
            );

            // Lấy thông tin problem
            const problem = await this.problemsService.getById(
                currentUser,
                submission.problem_id,
                {},
            );

            // Tạo object sạch chỉ với dữ liệu cần thiết
            const cleanSubmission = {
                _id: submission._id,
                submission_id: submission.submission_id,
                student_id: submission.student_id,
                class_id: submission.class_id,
                judge_node_id: submission.judge_node_id,
                code: submission.code,
                language_id: submission.language_id,
                status: submission.status,
                score: submission.score,
                execution_time_ms: submission.execution_time_ms,
                memory_used_mb: submission.memory_used_mb,
                test_cases_passed: submission.test_cases_passed,
                total_test_cases: submission.total_test_cases,
                error_message: submission.error_message,
                submission_token: submission.submission_token,
                submitted_at: submission.submitted_at,
                judged_at: submission.judged_at,
                createdAt: (submission as any).createdAt,
                updatedAt: (submission as any).updatedAt,
                user: submissionUser
                    ? {
                          _id: submissionUser._id,
                          username: submissionUser.username,
                          email: submissionUser.email,
                          fullname: submissionUser.fullname,
                          systemRole: submissionUser.systemRole,
                      }
                    : undefined,
                problem: problem
                    ? {
                          _id: problem._id,
                          name: problem.name,
                          description: problem.description,
                          difficulty: problem.difficulty,
                          time_limit_ms: problem.time_limit_ms,
                          memory_limit_mb: problem.memory_limit_mb,
                          number_of_tests: problem.number_of_tests,
                      }
                    : undefined,
            };

            this.logger.log(`Submission enriched successfully`);
            return cleanSubmission;
        } catch (error) {
            this.logger.error(`Error enriching submission: ${error.message}`);
            // Trả về submission gốc nếu có lỗi, nhưng cũng làm sạch
            return {
                _id: submission._id,
                submission_id: submission.submission_id,
                student_id: submission.student_id,
                class_id: submission.class_id,
                judge_node_id: submission.judge_node_id,
                code: submission.code,
                language_id: submission.language_id,
                status: submission.status,
                score: submission.score,
                execution_time_ms: submission.execution_time_ms,
                memory_used_mb: submission.memory_used_mb,
                test_cases_passed: submission.test_cases_passed,
                total_test_cases: submission.total_test_cases,
                error_message: submission.error_message,
                submission_token: submission.submission_token,
                submitted_at: submission.submitted_at,
                judged_at: submission.judged_at,
                createdAt: (submission as any).createdAt,
                updatedAt: (submission as any).updatedAt,
            };
        }
    }
}
