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
import { ProblemsService } from "@module/problems/services/problems.services";
import { ProblemsCountService } from "@module/problems/services/problems-count.service";
import { UserProblemProgressService } from "@module/user-problem-progress/services/user-problem-progress.service";
import { CreateUserDto } from "@module/user/dto/create-user.dto";
import { UserRepository } from "@module/user/repository/user-repository.interface";
import { UserProfileDto } from "../dto/user-profile.dto";
import { LanguageStatDto } from "../dto/language-stat.dto";
import { RecentACDto } from "../dto/recent-ac.dto";
import { SkillStatDto } from "../dto/skill-stat.dto";
import { ProblemDifficulty } from "@module/problems/entities/problems.entity";
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
import { SystemStatisticsDto } from "../dto/system-statistics.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService
    extends BaseService<User, UserRepository>
    implements OnApplicationBootstrap
{
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(Entity.USER)
        private readonly userRepository: UserRepository,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService<Configuration>,
        @InjectTransaction()
        private readonly userTransaction: BaseTransaction,
        @Inject(forwardRef(() => StudentSubmissionsService))
        private readonly studentSubmissionsService: StudentSubmissionsService,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
        @Inject(forwardRef(() => ProblemsCountService))
        private readonly problemsCountService: ProblemsCountService,
        @Inject(forwardRef(() => UserProblemProgressService))
        private readonly userProblemProgressService: UserProblemProgressService,
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
            difficulty_stats: {
                easy: { solved: 0, total: 0 },
                medium: { solved: 0, total: 0 },
                hard: { solved: 0, total: 0 },
            },
            activity_data: [],
            total_active_days: 0,
            max_streak: 0,
            current_streak: 0,
            recent_submissions: [],
            progress_stats: { solved: 0, total: 0, attempting: 0 },
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

        // Thống kê theo độ khó
        const difficultyStats = await this.getDifficultyStats(submissions);

        // Dữ liệu hoạt động
        const activityData = this.getActivityData(submissions, 30); // 30 ngày gần nhất
        const totalActiveDays = this.getTotalActiveDays(submissions);
        const streakData = this.getStreakData(submissions);

        // Bài nộp gần đây
        const recentSubmissions = await this.getRecentSubmissions(
            submissions,
            10,
        );

        // Thống kê tiến trình
        const progressStats = await this.getProgressStats(userId);

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
            difficulty_stats: difficultyStats,
            activity_data: activityData,
            total_active_days: totalActiveDays,
            max_streak: streakData.maxStreak,
            current_streak: streakData.currentStreak,
            recent_submissions: recentSubmissions,
            progress_stats: progressStats,
        };
    }

    async getSystemStatistics(): Promise<SystemStatisticsDto> {
        // Lấy tất cả submissions trong hệ thống
        const allSubmissions = await this.studentSubmissionsService.getMany(
            {} as User, // Dummy user cho admin query
            {},
            { limit: 50000 }, // Lấy tối đa 50000 submissions
        );

        // Lấy tất cả users
        const allUsers = await this.userRepository.getMany({}, {});

        // Dùng ProblemsCountService để đếm tổng số problems
        const totalProblems =
            await this.problemsCountService.getTotalProblemsCount();

        // Log để debug
        this.logger.log(`System statistics - Total problems: ${totalProblems}`);

        // Tính toán thời gian
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Thống kê cơ bản
        const totalSubmissions = allSubmissions.length;
        const todaySubmissions = allSubmissions.filter(
            (s) => new Date(s.submitted_at) >= today,
        ).length;
        const thisWeekSubmissions = allSubmissions.filter(
            (s) => new Date(s.submitted_at) >= thisWeekStart,
        ).length;
        const thisMonthSubmissions = allSubmissions.filter(
            (s) => new Date(s.submitted_at) >= thisMonthStart,
        ).length;

        const totalUsers = allUsers.length;

        // Tính tỷ lệ AC tổng
        const acceptedSubmissions = allSubmissions.filter(
            (s) => s.status === SubmissionStatus.ACCEPTED,
        ).length;
        const overallAcRate =
            totalSubmissions > 0
                ? (acceptedSubmissions / totalSubmissions) * 100
                : 0;

        // Thống kê theo ngày (7 ngày gần nhất)
        const dailySubmissions = this.getDailySubmissions(allSubmissions, 7);

        // Thống kê theo tuần (4 tuần gần nhất)
        const weeklySubmissions = this.getWeeklySubmissions(allSubmissions, 4);

        // Thống kê theo tháng (6 tháng gần nhất)
        const monthlySubmissions = this.getMonthlySubmissions(
            allSubmissions,
            6,
        );

        // Thống kê AC rate theo problem
        const problemAcStats = this.getProblemAcStats(allSubmissions);

        // Thống kê AC rate theo user
        const userAcStats = this.getUserAcStats(allSubmissions, allUsers);

        // Thống kê theo ngôn ngữ
        const languageStats: Record<string, number> = {};
        allSubmissions.forEach((submission) => {
            const lang = this.getLanguageName(submission.language_id);
            languageStats[lang] = (languageStats[lang] || 0) + 1;
        });

        // Thống kê theo trạng thái
        const statusStats: Record<string, number> = {};
        allSubmissions.forEach((submission) => {
            statusStats[submission.status] =
                (statusStats[submission.status] || 0) + 1;
        });

        // Top users và problems
        const topUsers = this.getTopUsers(allSubmissions, allUsers, 10);
        const topProblems = this.getTopProblems(allSubmissions, 10);

        return {
            total_submissions: totalSubmissions,
            today_submissions: todaySubmissions,
            this_week_submissions: thisWeekSubmissions,
            this_month_submissions: thisMonthSubmissions,
            total_users: totalUsers,
            total_problems: totalProblems,
            overall_ac_rate: Math.round(overallAcRate * 100) / 100,
            daily_submissions: dailySubmissions,
            weekly_submissions: weeklySubmissions,
            monthly_submissions: monthlySubmissions,
            problem_ac_stats: problemAcStats,
            user_ac_stats: userAcStats,
            language_stats: languageStats,
            status_stats: statusStats,
            top_users: topUsers,
            top_problems: topProblems,
        };
    }

    private getDailySubmissions(
        submissions: any[],
        days: number,
    ): Array<{ date: string; count: number }> {
        const result: Array<{ date: string; count: number }> = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            const count = submissions.filter((s) => {
                const submissionDate = new Date(s.submitted_at);
                return (
                    submissionDate.getFullYear() === date.getFullYear() &&
                    submissionDate.getMonth() === date.getMonth() &&
                    submissionDate.getDate() === date.getDate()
                );
            }).length;

            result.push({ date: dateStr, count });
        }

        return result;
    }

    private getWeeklySubmissions(
        submissions: any[],
        weeks: number,
    ): Array<{ week: string; count: number }> {
        const result: Array<{ week: string; count: number }> = [];
        const now = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay() - i * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const year = weekStart.getFullYear();
            const weekNumber = this.getWeekNumber(weekStart);
            const weekStr = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

            const count = submissions.filter((s) => {
                const submissionDate = new Date(s.submitted_at);
                return submissionDate >= weekStart && submissionDate <= weekEnd;
            }).length;

            result.push({ week: weekStr, count });
        }

        return result;
    }

    private getMonthlySubmissions(
        submissions: any[],
        months: number,
    ): Array<{ month: string; count: number }> {
        const result: Array<{ month: string; count: number }> = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${month.getFullYear()}-${(month.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;

            const count = submissions.filter((s) => {
                const submissionDate = new Date(s.submitted_at);
                return (
                    submissionDate.getFullYear() === month.getFullYear() &&
                    submissionDate.getMonth() === month.getMonth()
                );
            }).length;

            result.push({ month: monthStr, count });
        }

        return result;
    }

    private getProblemAcStats(submissions: any[]): Array<{
        problem_id: string;
        problem_name: string;
        total_submissions: number;
        accepted_submissions: number;
        ac_rate: number;
    }> {
        const problemStats: Record<
            string,
            {
                problem_id: string;
                problem_name: string;
                total_submissions: number;
                accepted_submissions: number;
            }
        > = {};

        submissions.forEach((submission) => {
            const problemId = submission.problem_id;
            if (!problemStats[problemId]) {
                problemStats[problemId] = {
                    problem_id: problemId,
                    problem_name: `Problem ${problemId}`, // Có thể lấy từ ProblemsService sau
                    total_submissions: 0,
                    accepted_submissions: 0,
                };
            }

            problemStats[problemId].total_submissions++;
            if (submission.status === SubmissionStatus.ACCEPTED) {
                problemStats[problemId].accepted_submissions++;
            }
        });

        return Object.values(problemStats).map((stat) => ({
            ...stat,
            ac_rate:
                Math.round(
                    (stat.accepted_submissions / stat.total_submissions) *
                        100 *
                        100,
                ) / 100,
        }));
    }

    private getUserAcStats(
        submissions: any[],
        users: User[],
    ): Array<{
        user_id: string;
        username: string;
        total_submissions: number;
        accepted_submissions: number;
        ac_rate: number;
    }> {
        const userStats: Record<
            string,
            {
                user_id: string;
                username: string;
                total_submissions: number;
                accepted_submissions: number;
            }
        > = {};

        submissions.forEach((submission) => {
            const userId = submission.student_id;
            if (!userStats[userId]) {
                const user = users.find((u) => u._id === userId);
                userStats[userId] = {
                    user_id: userId,
                    username: user?.username || `User ${userId}`,
                    total_submissions: 0,
                    accepted_submissions: 0,
                };
            }

            userStats[userId].total_submissions++;
            if (submission.status === SubmissionStatus.ACCEPTED) {
                userStats[userId].accepted_submissions++;
            }
        });

        return Object.values(userStats).map((stat) => ({
            ...stat,
            ac_rate:
                Math.round(
                    (stat.accepted_submissions / stat.total_submissions) *
                        100 *
                        100,
                ) / 100,
        }));
    }

    private getTopUsers(
        submissions: any[],
        users: User[],
        limit: number,
    ): Array<{
        user_id: string;
        username: string;
        total_submissions: number;
        accepted_submissions: number;
    }> {
        const userStats = this.getUserAcStats(submissions, users);
        return userStats
            .sort((a, b) => b.total_submissions - a.total_submissions)
            .slice(0, limit)
            .map((stat) => ({
                user_id: stat.user_id,
                username: stat.username,
                total_submissions: stat.total_submissions,
                accepted_submissions: stat.accepted_submissions,
            }));
    }

    private getTopProblems(
        submissions: any[],
        limit: number,
    ): Array<{
        problem_id: string;
        problem_name: string;
        total_submissions: number;
        accepted_submissions: number;
    }> {
        const problemStats = this.getProblemAcStats(submissions);
        return problemStats
            .sort((a, b) => b.total_submissions - a.total_submissions)
            .slice(0, limit)
            .map((stat) => ({
                problem_id: stat.problem_id,
                problem_name: stat.problem_name,
                total_submissions: stat.total_submissions,
                accepted_submissions: stat.accepted_submissions,
            }));
    }

    private getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
            (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
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

    // Helper methods for enhanced statistics
    private async getDifficultyStats(
        submissions: any[],
    ): Promise<Record<string, { solved: number; total: number }>> {
        const difficultyStats: Record<
            string,
            { solved: number; total: number }
        > = {
            easy: { solved: 0, total: 0 },
            medium: { solved: 0, total: 0 },
            hard: { solved: 0, total: 0 },
        };

        // Lấy thông tin problems để biết độ khó
        const problemIds = [...new Set(submissions.map((s) => s.problem_id))];
        const problems = await this.problemsService.getMany(
            {} as User,
            { _id: { $in: problemIds } },
            {},
        );

        const problemDifficultyMap: Record<string, number> = {};
        problems.forEach((problem) => {
            problemDifficultyMap[problem._id] = problem.difficulty;
        });

        // Tính toán thống kê theo độ khó
        submissions.forEach((submission) => {
            const difficulty = problemDifficultyMap[submission.problem_id] || 1;
            let difficultyKey = "easy";
            if (difficulty >= 3) difficultyKey = "hard";
            else if (difficulty >= 2) difficultyKey = "medium";

            difficultyStats[difficultyKey].total++;
            if (submission.status === SubmissionStatus.ACCEPTED) {
                difficultyStats[difficultyKey].solved++;
            }
        });

        return difficultyStats;
    }

    private getActivityData(
        submissions: any[],
        days: number,
    ): Array<{ date: string; submissions_count: number }> {
        const result: Array<{ date: string; submissions_count: number }> = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            const count = submissions.filter((s) => {
                const submissionDate = new Date(s.submitted_at);
                return (
                    submissionDate.getFullYear() === date.getFullYear() &&
                    submissionDate.getMonth() === date.getMonth() &&
                    submissionDate.getDate() === date.getDate()
                );
            }).length;

            result.push({ date: dateStr, submissions_count: count });
        }

        return result;
    }

    private getTotalActiveDays(submissions: any[]): number {
        const activeDays = new Set();
        submissions.forEach((submission) => {
            const date = new Date(submission.submitted_at);
            const dateStr = date.toISOString().split("T")[0];
            activeDays.add(dateStr);
        });
        return activeDays.size;
    }

    private getStreakData(submissions: any[]): {
        maxStreak: number;
        currentStreak: number;
    } {
        const activeDays = new Set();
        submissions.forEach((submission) => {
            const date = new Date(submission.submitted_at);
            const dateStr = date.toISOString().split("T")[0];
            activeDays.add(dateStr);
        });

        const sortedDays = Array.from(activeDays).sort();
        let maxStreak = 0;
        let currentStreak = 0;
        let tempStreak = 1;

        for (let i = 1; i < sortedDays.length; i++) {
            const prevDate = new Date(sortedDays[i - 1] as string);
            const currDate = new Date(sortedDays[i] as string);
            const diffDays = Math.floor(
                (currDate.getTime() - prevDate.getTime()) /
                    (1000 * 60 * 60 * 24),
            );

            if (diffDays === 1) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);

        // Tính current streak
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        let streakCount = 0;
        const checkDate = new Date(today);

        while (activeDays.has(checkDate.toISOString().split("T")[0])) {
            streakCount++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        currentStreak = streakCount;

        return { maxStreak, currentStreak };
    }

    private async getRecentSubmissions(
        submissions: any[],
        limit: number,
    ): Promise<
        Array<{
            problem_name: string;
            submitted_at: string;
            status: string;
            language: string;
        }>
    > {
        const recentSubs = submissions
            .sort(
                (a, b) =>
                    new Date(b.submitted_at).getTime() -
                    new Date(a.submitted_at).getTime(),
            )
            .slice(0, limit);

        const problemIds = [...new Set(recentSubs.map((s) => s.problem_id))];
        const problems = await this.problemsService.getMany(
            {} as User,
            { _id: { $in: problemIds } },
            {},
        );

        const problemNameMap: Record<string, string> = {};
        problems.forEach((problem) => {
            problemNameMap[problem._id] = problem.name;
        });

        return recentSubs.map((submission) => ({
            problem_name:
                problemNameMap[submission.problem_id] ||
                `Problem ${submission.problem_id}`,
            submitted_at: submission.submitted_at,
            status: submission.status,
            language: this.getLanguageName(submission.language_id),
        }));
    }

    private async getProgressStats(userId: string): Promise<{
        solved: number;
        total: number;
        attempting: number;
    }> {
        // Lấy tất cả submissions của user
        const submissions = await this.studentSubmissionsService.getMany(
            {} as User,
            { student_id: userId },
            { limit: 10000 },
        );

        // Lấy tất cả problems mà user đã submit
        const attemptedProblems = new Set(submissions.map((s) => s.problem_id));
        const solvedProblems = new Set(
            submissions
                .filter((s) => s.status === SubmissionStatus.ACCEPTED)
                .map((s) => s.problem_id),
        );

        // Lấy tổng số problems trong hệ thống
        const totalProblems =
            await this.problemsCountService.getTotalProblemsCount();

        return {
            solved: solvedProblems.size,
            total: 699,
            attempting: attemptedProblems.size - solvedProblems.size,
        };
    }

    async getUserProfile(user: User): Promise<UserProfileDto> {
        const userId = user._id;

        // 1. Lấy tất cả các bài đã AC của user với thông tin problem và sub_topic
        const solvedProgresses = await this.userProblemProgressService.getMany(
            {} as any,
            { user_id: userId, is_solved: true } as any,
            {
                population: [
                    {
                        path: "problem",
                        population: [{ path: "sub_topic" }],
                    },
                ],
                sort: { solved_at: -1 },
            },
        );

        const totalSolved = solvedProgresses.length;

        // 2. Tính rank - số user có số bài AC > số bài AC của user hiện tại
        const allUsersStats = await this.userProblemProgressService.getMany(
            {} as any,
            { is_solved: true } as any,
            {},
        );

        // Đếm số bài AC của từng user
        const userACCount: Record<string, number> = {};
        allUsersStats.forEach((progress: any) => {
            const uid = progress.user_id;
            userACCount[uid] = (userACCount[uid] || 0) + 1;
        });

        // Đếm số user có số bài AC >= user hiện tại
        let rank = 1;
        const currentUserAC = totalSolved;
        for (const [uid, acCount] of Object.entries(userACCount)) {
            if (uid !== userId && acCount > currentUserAC) {
                rank++;
            }
        }

        // 3. Tính số bài theo độ khó (solved và total)
        let easyAC = 0;
        let mediumAC = 0;
        let hardAC = 0;

        solvedProgresses.forEach((progress: any) => {
            const difficulty = progress.problem?.difficulty;
            if (difficulty === ProblemDifficulty.EASY || difficulty === 2) {
                easyAC++;
            } else if (
                difficulty === ProblemDifficulty.NORMAL ||
                difficulty === 3
            ) {
                mediumAC++;
            } else if (
                difficulty === ProblemDifficulty.HARD ||
                difficulty === ProblemDifficulty.VERY_HARD ||
                difficulty === 4 ||
                difficulty === 5
            ) {
                hardAC++;
            }
        });

        // Đếm tổng số bài theo độ khó từ Problems repository
        const allProblems = await this.problemsService.getMany(
            user,
            { is_active: true, is_public: true } as any,
            {},
        );

        let easyTotal = 0;
        let mediumTotal = 0;
        let hardTotal = 0;

        allProblems.forEach((problem: any) => {
            const difficulty = problem.difficulty;
            if (difficulty === ProblemDifficulty.EASY || difficulty === 2) {
                easyTotal++;
            } else if (
                difficulty === ProblemDifficulty.NORMAL ||
                difficulty === 3
            ) {
                mediumTotal++;
            } else if (
                difficulty === ProblemDifficulty.HARD ||
                difficulty === ProblemDifficulty.VERY_HARD ||
                difficulty === 4 ||
                difficulty === 5
            ) {
                hardTotal++;
            }
        });

        // 4. Tính số bài AC theo ngôn ngữ từ submissions
        // Lấy tất cả submissions đã AC của user
        const acceptedSubmissions =
            await this.studentSubmissionsService.getMany(
                user,
                {
                    student_id: userId,
                    status: SubmissionStatus.ACCEPTED,
                } as any,
                { limit: 10000 },
            );

        // Map language_id sang tên ngôn ngữ
        const languageIdToName: Record<number, string> = {
            71: "python",
            63: "javascript",
            62: "java",
            54: "cpp",
            50: "c",
            51: "csharp",
            60: "go",
            73: "rust",
            68: "php",
            72: "ruby",
            83: "swift",
            78: "kotlin",
            74: "typescript",
        };

        // Đếm số bài unique đã AC theo từng ngôn ngữ
        const languageProblemCount: Record<string, Set<string>> = {};
        acceptedSubmissions.forEach((submission: any) => {
            const langName =
                languageIdToName[submission.language_id] ||
                `lang_${submission.language_id}`;
            if (!languageProblemCount[langName]) {
                languageProblemCount[langName] = new Set();
            }
            languageProblemCount[langName].add(submission.problem_id);
        });

        const languages: LanguageStatDto[] = Object.entries(
            languageProblemCount,
        ).map(([language, problemIds]) => ({
            language,
            problems_solved: problemIds.size,
        }));

        // 5. Recent AC - lấy 10 bài gần nhất
        const recentAC: RecentACDto[] = solvedProgresses
            .slice(0, 10)
            .map((progress: any) => ({
                problem_id: progress.problem_id,
                problem_name: progress.problem?.name || "Unknown",
                solved_at: progress.solved_at || new Date(),
            }));

        // 6. Skills - đếm số bài AC theo subtopic
        const subtopicCount: Record<
            string,
            { sub_topic_id: string; sub_topic_name: string; count: number }
        > = {};
        solvedProgresses.forEach((progress: any) => {
            const subTopic = progress.problem?.sub_topic;
            if (subTopic && subTopic._id) {
                const subTopicId = subTopic._id;
                if (!subtopicCount[subTopicId]) {
                    subtopicCount[subTopicId] = {
                        sub_topic_id: subTopicId,
                        sub_topic_name: subTopic.sub_topic_name || "Unknown",
                        count: 0,
                    };
                }
                subtopicCount[subTopicId].count++;
            }
        });

        const skills: SkillStatDto[] = Object.values(subtopicCount).map(
            (item) => ({
                sub_topic_id: item.sub_topic_id,
                sub_topic_name: item.sub_topic_name,
                problems_solved: item.count,
            }),
        );

        return {
            rank,
            username: user.username,
            fullname: user.fullname,
            easy_ac: { solved: easyAC, total: easyTotal },
            medium_ac: { solved: mediumAC, total: mediumTotal },
            hard_ac: { solved: hardAC, total: hardTotal },
            languages,
            recent_ac: recentAC,
            skills,
        };
    }
}
