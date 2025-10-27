import { createUserPassword } from "@common/constant";
import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { Configuration } from "@config/configuration";
import { ApiError } from "@config/exception/api-error";
import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { SettingKey } from "@module/setting/common/constant";
import { SettingService } from "@module/setting/setting.service";
import { StudentSubmissionsService } from "@module/student-submissions/services/student-submissions.services";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";
import { CreateUserDto } from "@module/user/dto/create-user.dto";
import { UserRepository } from "@module/user/repository/user-repository.interface";
import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    Inject,
    forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcryptjs";
import { SystemRole } from "../common/constant";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UserStatisticsDto } from "../dto/user-statistics.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService
    extends BaseService<User, UserRepository>
    implements OnApplicationBootstrap
{
    constructor(
        @InjectRepository(Entity.USER)
        private readonly userRepository: UserRepository,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService<Configuration>,
        @InjectTransaction()
        private readonly userTransaction: BaseTransaction,
        @Inject(forwardRef(() => StudentSubmissionsService))
        private readonly studentSubmissionsService: StudentSubmissionsService,
    ) {
        super(userRepository, {
            notFoundCode: "error-user-not-found",
            transaction: userTransaction,
        });
    }

    async testUser() {
        await this.userRepository.distinct("", { asd: 1 });
        const user = await this.userRepository.updateOne(
            {
                username: "admin",
            },
            {
                $inc: { __v: -1 },
                fullname: 1,
            },
        );
        return user;
    }

    async onApplicationBootstrap() {
        const setting = await this.settingService.getSettingValue(
            SettingKey.INIT_DATA,
        );
        const update = setting || {};
        if (!update.isAdminCreated) {
            const { defaultAdminUsername, defaultAdminPassword } =
                this.configService.get("server", {
                    infer: true,
                });

            // Kiểm tra xem admin user đã tồn tại chưa
            const existingAdmin = await this.userRepository.getOne(
                { username: defaultAdminUsername },
                { enableDataPartition: false },
            );

            if (!existingAdmin) {
                await this.userRepository.create({
                    username: defaultAdminUsername,
                    email: "admin@administrator.com",
                    password: await createUserPassword(defaultAdminPassword),
                    systemRole: SystemRole.ADMIN,
                    fullname: "Administrator",
                });
                Logger.verbose("Admin created");
            } else {
                Logger.verbose("Admin user already exists, skipping creation");
            }

            update.isAdminCreated = true;
            await this.settingService.setSettingValue(
                SettingKey.INIT_DATA,
                update,
            );
        }
    }

    async internalGetById(id: string) {
        return this.userRepository.getById(id, { enableDataPartition: false });
    }

    async getMe(authData: RequestAuthData) {
        const user = await authData.getUser();
        return user;
    }

    async create(user: User, dto: CreateUserDto): Promise<User> {
        if (dto.password) {
            dto.password = await createUserPassword(dto.password);
        }
        const t = await this.userTransaction.startTransaction();
        try {
            const res = await this.userRepository.create(dto, {
                transaction: t,
            });
            await this.userTransaction.commitTransaction(t);
            return res;
        } catch (err) {
            await this.userTransaction.abortTransaction(t);
            throw err;
        }
    }

    async changePasswordMe(user: User, dto: ChangePasswordDto) {
        const correctOldPassword = await this.comparePassword(
            user,
            dto.oldPass,
        );
        if (!correctOldPassword) {
            throw ApiError.BadRequest("error-old-password-wrong");
        }
        user.password = await createUserPassword(dto.newPass);
        const res = await this.userRepository.updateById(user._id, {
            password: dto.oldPass,
        });
        return res;
    }

    async comparePassword(user: User, password: string) {
        return bcrypt.compare(password, user.password);
    }

    async getUserStatistics(user: User): Promise<UserStatisticsDto> {
        // Lấy tất cả submissions của user
        const submissions = await this.studentSubmissionsService.getMany(
            user,
            { student_id: user._id },
            { limit: 10000 }, // Lấy tối đa 10000 submissions
        );

        // Tính toán các thống kê
        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.ACCEPTED,
        ).length;
        const wrongAnswerSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.WRONG_ANSWER,
        ).length;
        const timeLimitExceededSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.TIME_LIMIT_EXCEEDED,
        ).length;
        const memoryLimitExceededSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
        ).length;
        const runtimeErrorSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.RUNTIME_ERROR,
        ).length;
        const compileErrorSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.COMPILE_ERROR,
        ).length;
        const pendingSubmissions = submissions.filter(
            (s) =>
                s.status === SubmissionStatus.PENDING ||
                s.status === SubmissionStatus.RUNNING ||
                s.status === SubmissionStatus.JUDGING ||
                s.status === SubmissionStatus.IN_QUEUE ||
                s.status === SubmissionStatus.PROCESSING,
        ).length;

        // Tính tỷ lệ thành công
        const successRate =
            totalSubmissions > 0
                ? (acceptedSubmissions / totalSubmissions) * 100
                : 0;

        // Tính điểm trung bình
        const scoredSubmissions = submissions.filter(
            (s) => s.score !== null && s.score !== undefined,
        );
        const averageScore =
            scoredSubmissions.length > 0
                ? scoredSubmissions.reduce(
                      (sum, s) => sum + (s.score || 0),
                      0,
                  ) / scoredSubmissions.length
                : 0;

        // Lấy ngày nộp bài cuối cùng
        const lastSubmission =
            submissions.length > 0
                ? submissions.sort(
                      (a, b) =>
                          new Date(b.submitted_at).getTime() -
                          new Date(a.submitted_at).getTime(),
                  )[0]
                : null;
        const lastSubmissionDate = lastSubmission
            ? lastSubmission.submitted_at
            : null;

        // Đếm số bài đã giải được (unique problems)
        const solvedProblems = new Set(
            submissions
                .filter((s) => s.status === SubmissionStatus.ACCEPTED)
                .map((s) => s.problem_id),
        );
        const solvedProblemsCount = solvedProblems.size;

        // Thống kê theo ngôn ngữ lập trình
        const languageStats: Record<string, number> = {};
        submissions.forEach((submission) => {
            const lang = this.getLanguageName(submission.language_id);
            languageStats[lang] = (languageStats[lang] || 0) + 1;
        });

        // Tính ranking (tạm thời đặt là 0, có thể implement sau)
        const ranking = 0;
        const totalUsers = 0;

        return {
            total_submissions: totalSubmissions,
            accepted_submissions: acceptedSubmissions,
            wrong_answer_submissions: wrongAnswerSubmissions,
            time_limit_exceeded_submissions: timeLimitExceededSubmissions,
            memory_limit_exceeded_submissions: memoryLimitExceededSubmissions,
            runtime_error_submissions: runtimeErrorSubmissions,
            compile_error_submissions: compileErrorSubmissions,
            pending_submissions: pendingSubmissions,
            success_rate: Math.round(successRate * 100) / 100, // Làm tròn 2 chữ số thập phân
            average_score: Math.round(averageScore * 100) / 100,
            ranking,
            total_users: totalUsers,
            last_submission_date: lastSubmissionDate,
            solved_problems_count: solvedProblemsCount,
            language_stats: languageStats,
        };
    }

    async getUserStatisticsById(userId: string): Promise<UserStatisticsDto> {
        // Kiểm tra user có tồn tại không
        const targetUser = await this.userRepository.getById(userId);
        if (!targetUser) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Lấy tất cả submissions của user theo ID
        const submissions = await this.studentSubmissionsService.getMany(
            targetUser,
            { student_id: userId },
            { limit: 10000 }, // Lấy tối đa 10000 submissions
        );

        // Tính toán các thống kê (tương tự như getUserStatistics)
        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.ACCEPTED,
        ).length;
        const wrongAnswerSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.WRONG_ANSWER,
        ).length;
        const timeLimitExceededSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.TIME_LIMIT_EXCEEDED,
        ).length;
        const memoryLimitExceededSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
        ).length;
        const runtimeErrorSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.RUNTIME_ERROR,
        ).length;
        const compileErrorSubmissions = submissions.filter(
            (s) => s.status === SubmissionStatus.COMPILE_ERROR,
        ).length;
        const pendingSubmissions = submissions.filter(
            (s) =>
                s.status === SubmissionStatus.PENDING ||
                s.status === SubmissionStatus.RUNNING ||
                s.status === SubmissionStatus.JUDGING ||
                s.status === SubmissionStatus.IN_QUEUE ||
                s.status === SubmissionStatus.PROCESSING,
        ).length;

        // Tính tỷ lệ thành công
        const successRate =
            totalSubmissions > 0
                ? (acceptedSubmissions / totalSubmissions) * 100
                : 0;

        // Tính điểm trung bình
        const scoredSubmissions = submissions.filter(
            (s) => s.score !== null && s.score !== undefined,
        );
        const averageScore =
            scoredSubmissions.length > 0
                ? scoredSubmissions.reduce(
                      (sum, s) => sum + (s.score || 0),
                      0,
                  ) / scoredSubmissions.length
                : 0;

        // Lấy ngày nộp bài cuối cùng
        const lastSubmission =
            submissions.length > 0
                ? submissions.sort(
                      (a, b) =>
                          new Date(b.submitted_at).getTime() -
                          new Date(a.submitted_at).getTime(),
                  )[0]
                : null;
        const lastSubmissionDate = lastSubmission
            ? lastSubmission.submitted_at
            : null;

        // Đếm số bài đã giải được (unique problems)
        const solvedProblems = new Set(
            submissions
                .filter((s) => s.status === SubmissionStatus.ACCEPTED)
                .map((s) => s.problem_id),
        );
        const solvedProblemsCount = solvedProblems.size;

        // Thống kê theo ngôn ngữ lập trình
        const languageStats: Record<string, number> = {};
        submissions.forEach((submission) => {
            const lang = this.getLanguageName(submission.language_id);
            languageStats[lang] = (languageStats[lang] || 0) + 1;
        });

        // Tính ranking (tạm thời đặt là 0, có thể implement sau)
        const ranking = 0;
        const totalUsers = 0;

        return {
            total_submissions: totalSubmissions,
            accepted_submissions: acceptedSubmissions,
            wrong_answer_submissions: wrongAnswerSubmissions,
            time_limit_exceeded_submissions: timeLimitExceededSubmissions,
            memory_limit_exceeded_submissions: memoryLimitExceededSubmissions,
            runtime_error_submissions: runtimeErrorSubmissions,
            compile_error_submissions: compileErrorSubmissions,
            pending_submissions: pendingSubmissions,
            success_rate: Math.round(successRate * 100) / 100, // Làm tròn 2 chữ số thập phân
            average_score: Math.round(averageScore * 100) / 100,
            ranking,
            total_users: totalUsers,
            last_submission_date: lastSubmissionDate,
            solved_problems_count: solvedProblemsCount,
            language_stats: languageStats,
        };
    }

    private getLanguageName(languageId: number): string {
        const languageMap: Record<number, string> = {
            71: "python",
            54: "cpp",
            62: "java",
            50: "c",
            51: "csharp",
            60: "go",
            73: "rust",
            68: "php",
            72: "ruby",
            83: "swift",
            78: "kotlin",
            74: "typescript",
            63: "javascript",
        };
        return languageMap[languageId] || "unknown";
    }
}
