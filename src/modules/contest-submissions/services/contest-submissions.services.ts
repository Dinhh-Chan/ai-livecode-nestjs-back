import { BaseService } from "@config/service/base.service";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { ContestSubmissionsRepository } from "../repository/contest-submissions-repository.interface";
import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { StudentSubmissionsService } from "@module/student-submissions/services/student-submissions.services";
import { SubmitContestCodeDto } from "../dto/submit-contest-code.dto";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";
import { ApiError } from "@config/exception/api-error";
import { ContestUsersService } from "@module/contest-users/services/contest-users.services";
import { ContestsService } from "@module/contests/services/contests.services";
import { GetManyQuery } from "@common/constant";
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

        // Lưu tất cả submissions vào ContestSubmissions (cả AC và không AC)
        const contestSubmission = await this.create(user, {
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

        // Nếu AC và là lần đầu AC problem này trong contest, tăng accepted_count
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

            // Nếu chỉ có 1 submission AC (submission vừa tạo), nghĩa là lần đầu AC
            if (existingACSubmissions.length === 1) {
                // Tăng accepted_count trong ContestUsers
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
        return this.getMany(
            user,
            {
                contest_id: contestId,
                student_id: user._id,
            } as any,
            query || { sort: { solved_at: -1 } },
        );
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
}
