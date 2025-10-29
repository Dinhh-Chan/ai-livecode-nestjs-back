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
import { UserService } from "@module/user/service/user.service";
import { UserProblemProgressService } from "@module/user-problem-progress/services/user-problem-progress.service";
import { forwardRef, Inject } from "@nestjs/common";
import { JudgeNodesService } from "@module/judge-nodes/services/judge-nodes.services";

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
        private readonly userService: UserService,
        private readonly judgeNodesService: JudgeNodesService,
        @Inject(forwardRef(() => UserProblemProgressService))
        private readonly userProblemProgressService: UserProblemProgressService,
    ) {
        super(studentSubmissionsRepository);
    }

    /**
     * Ghi đè getById để trả về submission với thông tin problem đầy đủ
     */
    async getById(user: User, id: string, query?: any): Promise<any> {
        this.logger.log(`Getting submission by ID: ${id}`);
        const submission = await this.studentSubmissionsRepository.getById(
            id,
            {},
        );
        this.logger.log(`Submission found: ${submission ? "yes" : "no"}`);
        if (!submission) {
            this.logger.error(`Submission not found with ID: ${id}`);
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy submission",
            });
        }

        // Làm giàu submission với thông tin user và problem
        return await this.enrichSubmissionWithDetails(submission, user);
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

        return enrichedSubmissions;
    }

    /**
     * Lấy submissions của user hiện tại theo problem ID với thông tin user và problem
     */
    async getSubmissionsByProblem(
        user: User,
        problemId: string,
        limit: number = 100,
    ): Promise<any[]> {
        const submissions =
            await this.studentSubmissionsRepository.findByStudentAndProblem(
                user._id,
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
     * Ghi đè getPage để trả về submissions với thông tin problem đầy đủ (giống getMany)
     */
    async getPage(user: User, conditions: any, query: any): Promise<any> {
        // Đảm bảo có default values cho page và limit
        const pageQuery = {
            ...query,
            page: query?.page || 1,
            limit: query?.limit || 20,
            skip:
                query?.skip !== undefined
                    ? query.skip
                    : query?.page
                      ? (query.page - 1) * (query.limit || 20)
                      : 0,
            enableDataPartition: false, // Disable data partition để lấy tất cả submissions
        };

        // Lấy danh sách submissions phân trang cơ bản
        const pageResult = await this.studentSubmissionsRepository.getPage(
            conditions || {},
            pageQuery,
        );

        // Làm giàu từng submission với thông tin user và problem (giống getMany)
        if (pageResult.result && pageResult.result.length > 0) {
            const enrichedSubmissions = await Promise.all(
                pageResult.result.map(async (submission: any) => {
                    return await this.enrichSubmissionWithDetails(
                        submission,
                        user,
                    );
                }),
            );

            return {
                ...pageResult,
                result: enrichedSubmissions,
            };
        }

        return pageResult;
    }

    /**
     * Ghi đè getMany để trả về submissions với thông tin problem đầy đủ
     */
    async getMany(user: User, conditions: any, query: any): Promise<any[]> {
        this.logger.log(
            `Getting submissions with details, conditions: ${JSON.stringify(conditions)}`,
        );

        // Lấy danh sách submissions cơ bản
        const submissions = await super.getMany(user, conditions, query);

        // Làm giàu từng submission với thông tin user và problem
        const enrichedSubmissions = await Promise.all(
            submissions.map(async (submission) => {
                return await this.enrichSubmissionWithDetails(submission, user);
            }),
        );

        this.logger.log(
            `Enriched ${enrichedSubmissions.length} submissions with problem details`,
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
        // Cập nhật trạng thái submission
        const updatedSubmission =
            await this.studentSubmissionsRepository.updateSubmissionStatus(
                submissionId,
                status,
                additionalData,
            );

        // Nếu submission được chấp nhận, cập nhật tiến độ user
        if (status === SubmissionStatus.ACCEPTED) {
            try {
                await this.userProblemProgressService.updateProgressOnSubmission(
                    updatedSubmission.student_id,
                    {
                        problem_id: updatedSubmission.problem_id,
                        status,
                        score: updatedSubmission.score || 0,
                    },
                );

                this.logger.log(
                    `Updated progress for user ${updatedSubmission.student_id} on problem ${updatedSubmission.problem_id}`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to update progress for user ${updatedSubmission.student_id} on problem ${updatedSubmission.problem_id}: ${error.message}`,
                );
                // Không throw error để không ảnh hưởng đến việc cập nhật submission
            }
        } else {
            // Với các trạng thái khác, chỉ cập nhật attempt count
            try {
                await this.userProblemProgressService.updateProgressOnSubmission(
                    updatedSubmission.student_id,
                    {
                        problem_id: updatedSubmission.problem_id,
                        status,
                        score: updatedSubmission.score || 0,
                    },
                );
            } catch (error) {
                this.logger.error(
                    `Failed to update attempt count for user ${updatedSubmission.student_id} on problem ${updatedSubmission.problem_id}: ${error.message}`,
                );
            }
        }

        return updatedSubmission;
    }

    /**
     * Cập nhật tiến độ user khi có kết quả từ Judge0
     * Method này có thể được gọi từ webhook hoặc callback của Judge0
     */
    async updateUserProgressFromJudgeResult(
        submissionId: string,
        judgeResult: {
            status: SubmissionStatus;
            score?: number;
            execution_time_ms?: number;
            memory_used_mb?: number;
            test_cases_passed?: number;
            total_test_cases?: number;
        },
    ): Promise<void> {
        try {
            // Lấy submission để có thông tin user và problem
            const submission = await this.studentSubmissionsRepository.getOne(
                { submission_id: submissionId },
                {},
            );

            if (!submission) {
                this.logger.error(`Submission ${submissionId} not found`);
                return;
            }

            // Cập nhật tiến độ user
            await this.userProblemProgressService.updateProgressOnSubmission(
                submission.student_id,
                {
                    problem_id: submission.problem_id,
                    status: judgeResult.status,
                    score: judgeResult.score || 0,
                },
            );

            this.logger.log(
                `Updated progress for user ${submission.student_id} on problem ${submission.problem_id} with status ${judgeResult.status}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to update progress from judge result for submission ${submissionId}: ${error.message}`,
            );
        }
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

            // Cập nhật tiến độ user khi tạo submission mới
            try {
                await this.userProblemProgressService.updateProgressOnSubmission(
                    submissionData.student_id,
                    {
                        problem_id: submissionData.problem_id,
                        status: SubmissionStatus.PENDING,
                        score: 0,
                    },
                );

                this.logger.log(
                    `Updated progress for user ${submissionData.student_id} on problem ${submissionData.problem_id} - attempt recorded`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to update progress for user ${submissionData.student_id} on problem ${submissionData.problem_id}: ${error.message}`,
                );
                // Không throw error để không ảnh hưởng đến việc tạo submission
            }

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
        let selectedNode: any = null;
        const nodeLoadIncremented = false;
        let submissionId: string | null = null;

        try {
            // Kiểm tra problem có tồn tại không
            const problem = await this.problemsService.getById(
                user,
                dto.problem_id,
                {},
            );
            if (!problem) {
                throw ApiError.NotFound("error-setting-value-invalid", {
                    message: "Không tìm thấy bài tập",
                });
            }

            // Tạo submission ID
            submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Tạo submission record
            this.logger.log(`Creating submission with ID: ${submissionId}`);
            this.logger.log(`User ID: ${user._id}`);
            this.logger.log(`Problem ID: ${dto.problem_id}`);
            this.logger.log(`Language ID: ${dto.language_id}`);
            this.logger.log(`Code length: ${dto.code.length} characters`);

            // Chọn judge node phù hợp nhất
            selectedNode = await this.judgeNodesService.selectBestNode();
            if (!selectedNode) {
                this.logger.error("No available judge nodes found");
                throw ApiError.BadGateway("error-setting-value-invalid", {
                    message: "Không có Judge Node khả dụng",
                });
            }

            this.logger.log(
                `Selected judge node: ${selectedNode._id} (${selectedNode.name})`,
            );
            this.logger.log(`Judge node API URL: ${selectedNode.api_url}`);
            this.logger.log(
                `Judge node current load: ${selectedNode.current_load}/${selectedNode.max_capacity}`,
            );

            const submission = await this.createSubmission(user, {
                submission_id: submissionId,
                student_id: user._id,
                problem_id: dto.problem_id,
                class_id: dto.class_id,
                code: dto.code,
                language_id: dto.language_id,
                judge_node_id: selectedNode._id,
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
                    .getConfiguration(selectedNode.api_url)
                    .catch((error) => {
                        this.logger.error(
                            `Error connecting to Judge0 at ${selectedNode.api_url}: ${error.message}`,
                        );
                        return null;
                    });

                if (!judge0Config) {
                    this.logger.error(
                        `Judge0 service is not available at ${selectedNode.api_url}`,
                    );
                    // Giảm load vì đã tăng trước đó
                    if (nodeLoadIncremented) {
                        try {
                            await this.judgeNodesService.decrementLoad(
                                selectedNode._id,
                            );
                        } catch (decrementError) {
                            this.logger.error(
                                `Failed to decrement load: ${decrementError.message}`,
                            );
                        }
                    }
                    // Cập nhật submission status
                    await this.updateSubmissionResult(submissionId, {
                        status: SubmissionStatus.INTERNAL_ERROR,
                        error_message: `Judge0 service is not available at ${selectedNode.api_url}`,
                    });

                    // Trả về submission đã tạo
                    return this.studentSubmissionsRepository.getOne(
                        { submission_id: submissionId },
                        {},
                    );
                }

                this.logger.log(
                    `Judge0 service is available at ${selectedNode.api_url}`,
                );
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
                        `Submitting test case ${index + 1}/${testCases.length} to Judge0 at ${selectedNode.api_url}`,
                    );
                    const judge0Response = await this.judge0Service.submitCode(
                        judge0Request,
                        selectedNode.api_url,
                    );
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
            await this.pollJudge0Results(
                submissionId,
                validResults,
                selectedNode.api_url,
            );

            // Giảm load của node sau khi polling hoàn thành
            if (nodeLoadIncremented) {
                try {
                    await this.judgeNodesService.decrementLoad(
                        selectedNode._id,
                    );
                    this.logger.log(
                        `Decremented load for judge node: ${selectedNode._id}`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Failed to decrement load for node ${selectedNode._id}: ${error.message}`,
                    );
                }
            }

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

            // Đảm bảo giảm load nếu đã tăng nhưng có lỗi
            if (nodeLoadIncremented && selectedNode) {
                try {
                    await this.judgeNodesService.decrementLoad(
                        selectedNode._id,
                    );
                    this.logger.log(
                        `Decremented load for judge node ${selectedNode._id} due to error`,
                    );
                } catch (decrementError) {
                    this.logger.error(
                        `Failed to decrement load on error: ${decrementError.message}`,
                    );
                }
            }

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
        apiUrl?: string,
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
                            apiUrl,
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
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy submission",
            });
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
    ): Promise<RankingRecord[]> {
        try {
            this.logger.log(`Getting ranking with limit: ${limit}`);

            const acceptedSubmissions =
                await this.studentSubmissionsRepository.getMany(
                    { status: SubmissionStatus.ACCEPTED },
                    {},
                );

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

            // Lấy thông tin user cho tất cả users trước khi sắp xếp
            const allUserIds = rankingData.map((item) => item.userId);
            const allUsers = await this.getUsersByIds(allUserIds);
            const userMap = new Map(allUsers.map((u) => [u._id, u]));

            // Sắp xếp theo số bài đã giải (giảm dần), nếu cùng số bài thì sắp xếp theo tên (tăng dần)
            rankingData.sort((a, b) => {
                // Ưu tiên sắp xếp theo số bài đã giải (giảm dần)
                if (b.totalProblemsSolved !== a.totalProblemsSolved) {
                    return b.totalProblemsSolved - a.totalProblemsSolved;
                }

                // Nếu cùng số bài, sắp xếp theo tên (tăng dần)
                const userA = userMap.get(a.userId);
                const userB = userMap.get(b.userId);
                const nameA = userA?.fullname || userA?.username || "";
                const nameB = userB?.fullname || userB?.username || "";

                return nameA.localeCompare(nameB, "vi", {
                    sensitivity: "base",
                });
            });

            // Tạo danh sách ranking cuối cùng với rank đúng (không trùng)
            const finalRankings: RankingRecord[] = [];

            // Thêm top users với rank đúng (không trùng, sắp xếp theo tên khi cùng điểm)
            rankingData.slice(0, limit).forEach((item, index) => {
                const userData = userMap.get(item.userId);
                if (userData) {
                    // Rank luôn là index + 1 (không trùng)
                    const rankNumber = index + 1;

                    finalRankings.push({
                        rankNumber,
                        user: this.mapUserToRecord(userData),
                        totalProblemsSolved: item.totalProblemsSolved,
                    });
                }
            });

            // Nếu cần include current user và user không nằm trong top
            if (includeCurrentUser) {
                const currentUserIndex = rankingData.findIndex(
                    (item) => item.userId === user._id,
                );

                if (currentUserIndex !== -1 && currentUserIndex >= limit) {
                    const currentUser = await this.getUserById(user._id);
                    if (currentUser) {
                        // Thêm vào cuối danh sách với rankNumber tiếp theo
                        const nextRank = finalRankings.length + 1;

                        finalRankings.push({
                            rankNumber: nextRank,
                            user: this.mapUserToRecord(currentUser),
                            totalProblemsSolved:
                                rankingData[currentUserIndex]
                                    .totalProblemsSolved,
                        });
                    }
                }
            }

            // Đảm bảo rankNumber liên tục từ 1 đến n
            finalRankings.forEach((ranking, index) => {
                ranking.rankNumber = index + 1;
            });

            this.logger.log(
                `Ranking generated with ${finalRankings.length} users`,
            );

            return finalRankings;
        } catch (error) {
            this.logger.error(`Error getting ranking: ${error.message}`);
            throw error;
        }
    }

    /**
     * Lấy thông tin user theo IDs
     */
    private async getUsersByIds(userIds: string[]): Promise<User[]> {
        this.logger.log(`Getting users by IDs: ${userIds.join(", ")}`);

        if (userIds.length === 0) {
            return [];
        }

        try {
            // Sử dụng UserService để lấy thông tin users
            // Với Sequelize, sử dụng Op.in thay vì $in
            const { Op } = await import("sequelize");
            const users = await this.userService.getMany(
                { _id: { [Op.in]: userIds } } as any,
                {},
            );

            this.logger.log(`Found ${users.length} users`);
            return users;
        } catch (error) {
            this.logger.error(`Error getting users by IDs: ${error.message}`);
            return [];
        }
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

            // Lấy thông tin problem
            this.logger.log(
                `Fetching problem with ID: ${submission.problem_id}`,
            );
            const problem = await this.problemsService.getById(
                currentUser,
                submission.problem_id,
                {},
            );
            this.logger.log(`Problem fetched: ${problem ? "success" : "null"}`);

            // Lấy thông tin student
            let student = null;
            if (submission.student_id) {
                try {
                    // Sử dụng userService để lấy thông tin student
                    student = await this.userService.getById(
                        currentUser,
                        submission.student_id,
                    );
                    this.logger.log(
                        `Student fetched: ${student ? "success" : "null"}`,
                    );
                } catch (err) {
                    this.logger.error(`Error fetching student: ${err.message}`);
                }
            }

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
                student: student
                    ? {
                          _id: student._id,
                          username: student.username,
                          email: student.email,
                          fullname: student.fullname,
                          systemRole: student.systemRole,
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
