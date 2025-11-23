import { BaseService } from "@config/service/base.service";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { ContestSubmissionsRepository } from "../repository/contest-submissions-repository.interface";
import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { StudentSubmissionsService } from "@module/student-submissions/services/student-submissions.services";
import { SubmitContestCodeDto } from "../dto/submit-contest-code.dto";
import { SubmitContestMultipleChoiceDto } from "../dto/submit-contest-multiple-choice.dto";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";
import { ApiError } from "@config/exception/api-error";
import { ContestUsersService } from "@module/contest-users/services/contest-users.services";
import { ContestsService } from "@module/contests/services/contests.services";
import { GetManyQuery } from "@common/constant";
import { UserService } from "@module/user/service/user.service";
import { ProblemsService } from "@module/problems/services/problems.services";
import { ContestUserStatus } from "@module/contest-users/entities/contest-users.entity";

@Injectable()
export class ContestSubmissionsService extends BaseService<
    ContestSubmissions,
    ContestSubmissionsRepository
> {
    private readonly logger = new Logger(ContestSubmissionsService.name);

    constructor(
        @InjectRepository(Entity.CONTEST_SUBMISSIONS)
        private readonly contestSubmissionsRepository: ContestSubmissionsRepository,
        @Inject(forwardRef(() => StudentSubmissionsService))
        private readonly studentSubmissionsService: StudentSubmissionsService,
        @Inject(forwardRef(() => ContestUsersService))
        private readonly contestUsersService: ContestUsersService,
        @Inject(forwardRef(() => ContestsService))
        private readonly contestsService: ContestsService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
    ) {
        super(contestSubmissionsRepository);
    }

    /**
     * Submit code trong contest - lưu tất cả submissions (cả AC và không AC)
     * Code sẽ được submit qua StudentSubmissionsService
     * Nếu AC và là lần đầu AC problem này trong contest, sẽ tăng accepted_count
     */
    async submitCode(
        user: User,
        dto: SubmitContestCodeDto,
    ): Promise<ContestSubmissions | any> {
        // Kiểm tra user đã tham gia contest chưa
        const contestUser = await this.contestUsersService.getOne(
            user,
            {
                contest_id: dto.contest_id,
                user_id: user._id,
            } as any,
            {},
        );

        if (!contestUser) {
            throw ApiError.NotFound("error-contest-user-not-found", {
                message: "Bạn chưa tham gia contest này",
            });
        }

        if (contestUser.status !== ContestUserStatus.ENROLLED) {
            throw ApiError.BadRequest("error-contest-user-not-enrolled", {
                message: "Bạn chưa được duyệt tham gia contest này",
            });
        }

        // Kiểm tra contest có tồn tại không
        const contest = await this.contestsService.getById(
            user,
            dto.contest_id,
            {},
        );
        if (!contest) {
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy contest",
            });
        }

        // Kiểm tra problem có trong contest không
        const contestProblems = contest.contest_problems || [];
        const problemInContest = contestProblems.find(
            (cp: any) => cp.problem_id === dto.problem_id,
        );
        if (!problemInContest) {
            throw ApiError.BadRequest("error-setting-value-invalid", {
                message: "Bài tập này không có trong contest",
            });
        }

        // Submit code qua StudentSubmissionsService (nhưng không lưu vào lịch sử)
        // Tạo SubmitCodeDto từ SubmitContestCodeDto
        const studentSubmitDto = {
            code: dto.code,
            language_id: dto.language_id,
            problem_id: dto.problem_id,
            stdin: dto.stdin,
            cpu_time_limit: dto.cpu_time_limit,
            memory_limit: dto.memory_limit,
            compiler_options: dto.compiler_options,
            command_line_arguments: dto.command_line_arguments,
        };

        this.logger.log(
            `Submitting code for contest ${dto.contest_id}, problem ${dto.problem_id}`,
        );

        // Submit code và chờ kết quả
        const studentSubmission =
            await this.studentSubmissionsService.submitCode(
                user,
                studentSubmitDto,
            );

        this.logger.log(
            `Submission result: ${studentSubmission.status}, score: ${studentSubmission.score}`,
        );

        // Nếu AC, kiểm tra TRƯỚC KHI lưu xem đã có AC chưa
        let isFirstAC = false;
        if (studentSubmission.status === SubmissionStatus.ACCEPTED) {
            // Kiểm tra xem đã có submission AC cho problem này trong contest chưa
            const existingACSubmissions = await this.getMany(
                user,
                {
                    contest_id: dto.contest_id,
                    student_id: user._id,
                    problem_id: dto.problem_id,
                    status: SubmissionStatus.ACCEPTED,
                } as any,
                {},
            );

            // Nếu chưa có AC nào, đây là lần đầu AC
            if (existingACSubmissions.length === 0) {
                isFirstAC = true;
            }
        }

        // Lưu tất cả submissions vào ContestSubmissions (cả AC và không AC)
        let contestSubmission: ContestSubmissions;
        try {
            contestSubmission = await this.create(user, {
                contest_id: dto.contest_id,
                submission_id: studentSubmission.submission_id,
                student_id: user._id,
                problem_id: dto.problem_id,
                code: dto.code,
                language_id: dto.language_id,
                status: studentSubmission.status,
                score: studentSubmission.score || 0,
                execution_time_ms: studentSubmission.execution_time_ms || 0,
                memory_used_mb: studentSubmission.memory_used_mb || 0,
                test_cases_passed: studentSubmission.test_cases_passed || 0,
                total_test_cases: studentSubmission.total_test_cases || 0,
                submitted_at: studentSubmission.submitted_at || new Date(),
                solved_at:
                    studentSubmission.status === SubmissionStatus.ACCEPTED
                        ? new Date()
                        : undefined,
            } as any);
        } catch (error: any) {
            // Xử lý lỗi unique constraint - có thể do constraint chưa được xóa khỏi database
            if (
                error?.name === "SequelizeUniqueConstraintError" ||
                error?.original?.code === "23505"
            ) {
                this.logger.error(
                    `Unique constraint violation. Constraint 'contest_submissions_contest_student_problem_unique_idx' still exists in database. Please run migration to drop it.`,
                );
                throw ApiError.Conflict("error-unique-constraint", {
                    message:
                        "Không thể lưu submission. Unique constraint vẫn còn trong database. Vui lòng chạy migration để xóa constraint.",
                    detail: "Constraint 'contest_submissions_contest_student_problem_unique_idx' cần được xóa để cho phép nhiều submissions cho cùng một problem.",
                });
            }
            throw error;
        }

        // Nếu là lần đầu AC, tăng accepted_count
        if (isFirstAC) {
            await this.contestUsersService.incrementAcceptedCount(
                user,
                dto.contest_id,
                user._id,
                1,
            );

            this.logger.log(
                `First AC for user ${user._id}, problem ${dto.problem_id} in contest ${dto.contest_id}. Incremented accepted_count.`,
            );
        }

        this.logger.log(
            `Contest submission saved for user ${user._id}, problem ${dto.problem_id}, status: ${studentSubmission.status}`,
        );

        return contestSubmission;
    }

    /**
     * Lấy submissions của user trong contest
     */
    async getContestSubmissions(
        user: User,
        contestId: string,
        query?: GetManyQuery<ContestSubmissions>,
    ): Promise<ContestSubmissions[]> {
        const submissions = await this.getMany(
            user,
            {
                contest_id: contestId,
                student_id: user._id,
            } as any,
            query || { sort: { solved_at: -1 } },
        );

        // Gắn thông tin user vào từng submission
        const me = await this.userService.getById(user, user._id, {});
        const userInfo = me
            ? {
                  _id: me._id,
                  username: me.username,
                  fullname: me.fullname,
                  studentPtitCode: me.studentPtitCode,
              }
            : null;

        // Gắn thông tin problem (name, description) vào từng submission
        const problemIds = Array.from(
            new Set(submissions.map((s: any) => s.problem_id)),
        );
        let problemMap = new Map<string, any>();
        if (problemIds.length > 0) {
            const problems = await this.problemsService.getMany(
                user,
                { _id: { $in: problemIds } } as any,
                {},
            );
            problemMap = new Map(problems.map((p: any) => [p._id, p]));
        }

        return submissions.map((s: any) => {
            const p = problemMap.get(s.problem_id);
            const problemInfo = p
                ? {
                      _id: p._id,
                      name: p.name,
                      description: p.description,
                  }
                : null;
            return { ...s, user: userInfo, problem: problemInfo };
        });
    }

    /**
     * Lấy tất cả submissions trong contest (tất cả users) kèm user và problem info
     */
    async getContestAllSubmissions(
        user: User,
        contestId: string,
        query?: GetManyQuery<ContestSubmissions>,
    ): Promise<any[]> {
        const submissions = await this.getMany(
            user,
            {
                contest_id: contestId,
            } as any,
            query || { sort: { solved_at: -1 } },
        );

        if (submissions.length === 0) return [];

        // Build users map
        const studentIds = Array.from(
            new Set(submissions.map((s: any) => s.student_id)),
        );
        const users = await this.userService.getMany(
            user,
            { _id: { $in: studentIds } } as any,
            {},
        );
        const userMap = new Map(
            users.map((u: any) => [
                u._id,
                {
                    _id: u._id,
                    username: u.username,
                    fullname: u.fullname,
                    studentPtitCode: u.studentPtitCode,
                },
            ]),
        );

        // Build problems map
        const problemIds = Array.from(
            new Set(submissions.map((s: any) => s.problem_id)),
        );
        const problems = await this.problemsService.getMany(
            user,
            { _id: { $in: problemIds } } as any,
            {},
        );
        const problemMap = new Map(
            problems.map((p: any) => [
                p._id,
                {
                    _id: p._id,
                    name: p.name,
                    description: p.description,
                },
            ]),
        );

        // Map
        return submissions.map((s: any) => ({
            ...s,
            user: userMap.get(s.student_id) || null,
            problem: problemMap.get(s.problem_id) || null,
        }));
    }

    /**
     * Lấy submissions của user cho một problem trong contest
     */
    async getContestProblemSubmissions(
        user: User,
        contestId: string,
        problemId: string,
    ): Promise<ContestSubmissions[]> {
        return this.getMany(
            user,
            {
                contest_id: contestId,
                student_id: user._id,
                problem_id: problemId,
            } as any,
            { sort: { solved_at: -1 } },
        );
    }

    /**
     * Ghi đè getById để trả về submission với thông tin đầy đủ
     * Tương tự như StudentSubmissionsService.getById
     */
    async getById(user: User, id: string, query?: any): Promise<any> {
        this.logger.log(`Getting contest submission by ID: ${id}`);
        const submission = await this.contestSubmissionsRepository.getById(
            id,
            {},
        );

        if (!submission) {
            this.logger.error(`Contest submission not found with ID: ${id}`);
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy submission",
            });
        }

        // Lấy thông tin user
        const studentUser = await this.userService.getById(
            user,
            submission.student_id,
            {},
        );
        let userInfo = null;
        if (studentUser) {
            userInfo = {
                _id: studentUser._id,
                username: studentUser.username,
                fullname: studentUser.fullname,
                studentPtitCode: studentUser.studentPtitCode,
            };
        }

        // Lấy thông tin problem
        const problem = await this.problemsService.getById(
            user,
            submission.problem_id,
            {},
        );
        let problemInfo = null;
        if (problem) {
            problemInfo = {
                _id: problem._id,
                name: problem.name,
                description: problem.description,
                difficulty: problem.difficulty,
                is_multipleChoiceForm: problem.is_multipleChoiceForm,
                topic_id: problem.topic_id,
                sub_topic_id: problem.sub_topic_id,
                topic: problem.topic
                    ? {
                          _id: problem.topic._id,
                          name: problem.topic.name,
                          topic_name:
                              problem.topic.topic_name || problem.topic.name,
                      }
                    : undefined,
                sub_topic: problem.sub_topic
                    ? {
                          _id: problem.sub_topic._id,
                          sub_topic_name: problem.sub_topic.sub_topic_name,
                      }
                    : undefined,
                // Thêm multipleChoiceForm nếu is_multipleChoiceForm = true
                multipleChoiceForm:
                    problem.is_multipleChoiceForm &&
                    problem.multipleChoiceForm &&
                    typeof problem.multipleChoiceForm === "object" &&
                    !Array.isArray(problem.multipleChoiceForm)
                        ? problem.multipleChoiceForm
                        : undefined,
            };
        }

        // Lấy thông tin contest
        const contest = await this.contestsService.getById(
            user,
            submission.contest_id,
            {},
        );
        let contestInfo = null;
        if (contest) {
            contestInfo = {
                _id: contest._id,
                name: contest.name,
                description: contest.description,
            };
        }

        // Trả về submission với thông tin đầy đủ
        return {
            ...submission,
            user: userInfo,
            problem: problemInfo,
            contest: contestInfo,
        };
    }

    /**
     * Submit multiple choice trong contest - tương tự submitCode nhưng dùng submitMultipleChoice
     */
    async submitMultipleChoice(
        user: User,
        dto: SubmitContestMultipleChoiceDto,
    ): Promise<ContestSubmissions | any> {
        // Kiểm tra user đã tham gia contest chưa
        const contestUser = await this.contestUsersService.getOne(
            user,
            {
                contest_id: dto.contest_id,
                user_id: user._id,
            } as any,
            {},
        );

        if (!contestUser) {
            throw ApiError.NotFound("error-contest-user-not-found", {
                message: "Bạn chưa tham gia contest này",
            });
        }

        if (contestUser.status !== ContestUserStatus.ENROLLED) {
            throw ApiError.BadRequest("error-contest-user-not-enrolled", {
                message: "Bạn chưa được duyệt tham gia contest này",
            });
        }

        // Kiểm tra contest có tồn tại không
        const contest = await this.contestsService.getById(
            user,
            dto.contest_id,
            {},
        );
        if (!contest) {
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy contest",
            });
        }

        // Kiểm tra problem có trong contest không
        const contestProblems = contest.contest_problems || [];
        const problemInContest = contestProblems.find(
            (cp: any) => cp.problem_id === dto.problem_id,
        );
        if (!problemInContest) {
            throw ApiError.BadRequest("error-setting-value-invalid", {
                message: "Bài tập này không có trong contest",
            });
        }

        this.logger.log(
            `Submitting multiple choice for contest ${dto.contest_id}, problem ${dto.problem_id}`,
        );

        // Submit multiple choice qua StudentSubmissionsService
        const studentSubmission =
            await this.studentSubmissionsService.submitMultipleChoice(user, {
                problem_id: dto.problem_id,
                class_id: undefined, // Contest submissions không có class_id
                answer: dto.answer,
            });

        this.logger.log(
            `Multiple choice submission result: ${studentSubmission.status}, score: ${studentSubmission.score}`,
        );

        // Nếu AC, kiểm tra TRƯỚC KHI lưu xem đã có AC chưa
        let isFirstAC = false;
        if (studentSubmission.status === SubmissionStatus.ACCEPTED) {
            // Kiểm tra xem đã có submission AC cho problem này trong contest chưa
            const existingACSubmissions = await this.getMany(
                user,
                {
                    contest_id: dto.contest_id,
                    student_id: user._id,
                    problem_id: dto.problem_id,
                    status: SubmissionStatus.ACCEPTED,
                } as any,
                {},
            );

            // Nếu chưa có AC nào, đây là lần đầu AC
            if (existingACSubmissions.length === 0) {
                isFirstAC = true;
            }
        }

        // Lấy submission đã được cập nhật từ StudentSubmissions
        const updatedStudentSubmission =
            await this.studentSubmissionsService.getById(
                user,
                studentSubmission._id,
                {},
            );

        // Lưu vào ContestSubmissions (cả AC và không AC)
        let contestSubmission: ContestSubmissions;
        try {
            contestSubmission = await this.create(user, {
                contest_id: dto.contest_id,
                submission_id: updatedStudentSubmission.submission_id,
                student_id: user._id,
                problem_id: dto.problem_id,
                code: updatedStudentSubmission.code, // Đã được parse thành số
                language_id: updatedStudentSubmission.language_id || 0,
                status: updatedStudentSubmission.status,
                score: updatedStudentSubmission.score || 0,
                execution_time_ms:
                    updatedStudentSubmission.execution_time_ms || 0,
                memory_used_mb: updatedStudentSubmission.memory_used_mb || 0,
                test_cases_passed:
                    updatedStudentSubmission.test_cases_passed || 0,
                total_test_cases:
                    updatedStudentSubmission.total_test_cases || 0,
                submitted_at:
                    updatedStudentSubmission.submitted_at || new Date(),
                solved_at:
                    updatedStudentSubmission.status ===
                    SubmissionStatus.ACCEPTED
                        ? new Date()
                        : undefined,
            } as any);
        } catch (error: any) {
            // Xử lý lỗi unique constraint
            if (
                error?.name === "SequelizeUniqueConstraintError" ||
                error?.original?.code === "23505"
            ) {
                this.logger.error(
                    `Unique constraint violation. Constraint 'contest_submissions_contest_student_problem_unique_idx' still exists in database. Please run migration to drop it.`,
                );
                throw ApiError.Conflict("error-unique-constraint", {
                    message:
                        "Không thể lưu submission. Unique constraint vẫn còn trong database. Vui lòng chạy migration để xóa constraint.",
                    detail: "Constraint 'contest_submissions_contest_student_problem_unique_idx' cần được xóa để cho phép nhiều submissions cho cùng một problem.",
                });
            }
            throw error;
        }

        // Nếu là lần đầu AC, tăng accepted_count
        if (isFirstAC) {
            await this.contestUsersService.incrementAcceptedCount(
                user,
                dto.contest_id,
                user._id,
                1,
            );

            this.logger.log(
                `First AC for user ${user._id}, problem ${dto.problem_id} in contest ${dto.contest_id}. Incremented accepted_count.`,
            );
        }

        this.logger.log(
            `Contest multiple choice submission saved for user ${user._id}, problem ${dto.problem_id}, status: ${updatedStudentSubmission.status}`,
        );

        // Làm giàu với thông tin đầy đủ
        return await this.getById(user, contestSubmission._id, {});
    }
}
