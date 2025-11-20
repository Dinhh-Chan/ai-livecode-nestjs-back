import { BaseService } from "@config/service/base.service";
import { Class } from "../entities/class.entity";
import { ClassRepository } from "../repository/class-repository.interface";
import { Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetByIdQuery, GetManyQuery } from "@common/constant";
import { ClassStudentsService } from "@module/class-students/services/class-students.services";
import { StudentSubmissionsService } from "@module/student-submissions/services/student-submissions.services";
import { ProblemsService } from "@module/problems/services/problems.services";
import { TopicsService } from "@module/topics/services/topics.services";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "@config/configuration";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";
import { ProblemDifficulty } from "@module/problems/entities/problems.entity";
import { ApiError } from "@config/exception/api-error";
import { SystemRole } from "@module/user/common/constant";
import axios from "axios";
import {
    ClassOverviewDto,
    ClassOverallStatsDto,
    TopicPerformanceDto,
    StudentRankingDto,
    ProblemDifficultyStatsDto,
} from "../dto/class-overview.dto";

@Injectable()
export class ClassService extends BaseService<Class, ClassRepository> {
    private readonly logger = new Logger(ClassService.name);

    constructor(
        @InjectRepository(Entity.CLASSES)
        private readonly classRepository: ClassRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => ClassStudentsService))
        private readonly classStudentsService: ClassStudentsService,
        @Inject(forwardRef(() => StudentSubmissionsService))
        private readonly studentSubmissionsService: StudentSubmissionsService,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
        @Inject(forwardRef(() => TopicsService))
        private readonly topicsService: TopicsService,
        private readonly configService: ConfigService<Configuration>,
    ) {
        super(classRepository);
    }

    async getById(
        user: User,
        id: string,
        query?: GetByIdQuery<Class>,
    ): Promise<any> {
        const cls = await super.getById(user, id, query);
        if (!cls) return cls;
        if (!cls.teacher_id) return cls;
        const teacher = await this.userService.getById(
            user,
            cls.teacher_id,
            {},
        );
        if (!teacher) return cls;
        const { password, ssoId, email, ...basic } = teacher;
        return {
            ...cls,
            teacher_basic: {
                _id: basic._id,
                username: basic.username,
                fullname: basic.fullname,
            },
        };
    }

    async getMany(
        user: User,
        conditions: any,
        query?: GetManyQuery<Class>,
    ): Promise<any[]> {
        const list = await super.getMany(user, conditions, query);
        if (list.length === 0) return list as any[];
        const teacherIds = Array.from(
            new Set(list.map((c: any) => c.teacher_id).filter(Boolean)),
        );
        let teacherMap = new Map<string, any>();
        if (teacherIds.length > 0) {
            const users = await this.userService.getMany(
                user,
                { _id: { $in: teacherIds } } as any,
                {},
            );
            teacherMap = new Map(
                users.map((u: any) => [
                    u._id,
                    { _id: u._id, username: u.username, fullname: u.fullname },
                ]),
            );
        }
        return (list as any[]).map((c) => ({
            ...c,
            teacher_basic: teacherMap.get(c.teacher_id) || null,
        }));
    }

    async getClassOverview(
        user: User,
        classId: string,
    ): Promise<ClassOverviewDto> {
        // Lấy thông tin lớp
        const cls = await this.getById(user, classId);
        if (!cls) {
            throw ApiError.NotFound("error-setting-value-invalid", {
                message: "Không tìm thấy lớp học",
            });
        }

        // Kiểm tra quyền: chỉ giáo viên của lớp hoặc admin mới được xem
        if (
            user.systemRole !== SystemRole.ADMIN &&
            cls.teacher_id !== user._id
        ) {
            throw ApiError.Forbidden("error-forbidden");
        }

        // Lấy danh sách học sinh trong lớp
        const classStudents =
            await this.classStudentsService.getByClassWithUsers(user, classId);
        const studentIds = classStudents.map((cs) => cs.student_id);

        this.logger.log(`Class ${classId} has ${studentIds.length} students`);

        if (studentIds.length === 0) {
            // Trả về overview rỗng nếu không có học sinh
            return {
                overallStats: {
                    averageDifficulty: 0,
                    completionRate: 0,
                    averageScoreByDifficulty: {},
                    passRateByProblem: {},
                },
                strongTopics: [],
                weakTopics: [],
                topStudents: [],
                bottomStudents: [],
                difficultProblems: [],
                aiAnalysisKmark:
                    "## Phân tích lớp\nLớp học chưa có học sinh nào.",
            };
        }

        // Lấy tất cả submissions của lớp
        // Lấy theo student_id của các học sinh trong lớp (vì có thể submissions không có class_id)
        let allSubmissions: any[] = [];

        if (studentIds.length > 0) {
            // Lấy submissions theo student_id
            const submissionsByStudents = await Promise.all(
                studentIds.map((studentId) =>
                    this.studentSubmissionsService.getSubmissionsByStudent(
                        user,
                        studentId,
                        1000, // Lấy tối đa 1000 submissions mỗi học sinh
                    ),
                ),
            );
            allSubmissions = submissionsByStudents.flat();

            // Cũng lấy submissions theo class_id nếu có (để đảm bảo không bỏ sót)
            try {
                const submissionsByClass =
                    await this.studentSubmissionsService.getMany(
                        user,
                        { class_id: cls.class_id || classId } as any,
                        {
                            limit: 10000,
                            enableDataPartition: false,
                        } as any,
                    );
                // Merge và loại bỏ duplicate
                const existingIds = new Set(allSubmissions.map((s) => s._id));
                submissionsByClass.forEach((s) => {
                    if (!existingIds.has(s._id)) {
                        allSubmissions.push(s);
                    }
                });
            } catch (error) {
                this.logger.warn(
                    `Error getting submissions by class_id: ${error}`,
                );
            }
        }

        this.logger.log(
            `Found ${allSubmissions.length} submissions for class ${classId}`,
        );

        // Tính toán thống kê
        this.logger.log(
            `Calculating stats for ${allSubmissions.length} submissions`,
        );
        const stats = await this.calculateClassStats(
            user,
            studentIds,
            allSubmissions,
        );

        // Gọi AI để phân tích
        const aiAnalysis = await this.generateClassAiAnalysis(
            stats,
            allSubmissions,
        );

        return {
            ...stats,
            aiAnalysisKmark: aiAnalysis,
        };
    }

    private async calculateClassStats(
        user: User,
        studentIds: string[],
        submissions: any[],
    ): Promise<Omit<ClassOverviewDto, "aiAnalysisKmark">> {
        // Tính toán overall stats
        const overallStats = this.calculateOverallStats(submissions);

        // Tính toán topic performance
        const topicStats = await this.calculateTopicStats(user, submissions);

        // Tính toán student rankings
        const studentRankings = await this.calculateStudentRankings(
            user,
            studentIds,
            submissions,
        );

        // Tính toán difficult problems
        const difficultProblems = await this.calculateDifficultProblems(
            user,
            submissions,
        );

        return {
            overallStats,
            strongTopics: topicStats.strong,
            weakTopics: topicStats.weak,
            topStudents: studentRankings.top,
            bottomStudents: studentRankings.bottom,
            difficultProblems,
        };
    }

    private calculateOverallStats(submissions: any[]): ClassOverallStatsDto {
        if (submissions.length === 0) {
            return {
                averageDifficulty: 0,
                completionRate: 0,
                averageScoreByDifficulty: {},
                passRateByProblem: {},
            };
        }

        // Tính mức độ trung bình
        const difficulties = submissions
            .map((s) => s.problem?.difficulty || 0)
            .filter((d) => d > 0);
        const averageDifficulty =
            difficulties.length > 0
                ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length
                : 0;

        // Tính tỉ lệ hoàn thành (AC submissions / total submissions)
        const acceptedCount = submissions.filter(
            (s) => s.status === SubmissionStatus.ACCEPTED,
        ).length;
        const completionRate =
            submissions.length > 0
                ? (acceptedCount / submissions.length) * 100
                : 0;

        // Tính điểm trung bình theo độ khó
        const scoreByDifficulty: Record<string, number[]> = {};
        submissions.forEach((s) => {
            if (s.problem?.difficulty) {
                const diff = this.getDifficultyName(s.problem.difficulty);
                if (!scoreByDifficulty[diff]) {
                    scoreByDifficulty[diff] = [];
                }
                if (s.score !== null && s.score !== undefined) {
                    scoreByDifficulty[diff].push(Number(s.score));
                }
            }
        });

        const averageScoreByDifficulty: Record<string, number> = {};
        Object.keys(scoreByDifficulty).forEach((diff) => {
            const scores = scoreByDifficulty[diff];
            averageScoreByDifficulty[diff] =
                scores.length > 0
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : 0;
        });

        // Tính tỉ lệ vượt qua từng bài
        const problemStats: Record<
            string,
            { attempts: number; passed: number }
        > = {};
        submissions.forEach((s) => {
            const pid = s.problem_id;
            if (!problemStats[pid]) {
                problemStats[pid] = { attempts: 0, passed: 0 };
            }
            problemStats[pid].attempts++;
            if (s.status === SubmissionStatus.ACCEPTED) {
                problemStats[pid].passed++;
            }
        });

        const passRateByProblem: Record<string, number> = {};
        Object.keys(problemStats).forEach((pid) => {
            const stats = problemStats[pid];
            passRateByProblem[pid] =
                stats.attempts > 0 ? (stats.passed / stats.attempts) * 100 : 0;
        });

        return {
            averageDifficulty,
            completionRate,
            averageScoreByDifficulty,
            passRateByProblem,
        };
    }

    private async calculateTopicStats(
        user: User,
        submissions: any[],
    ): Promise<{ strong: TopicPerformanceDto[]; weak: TopicPerformanceDto[] }> {
        const topicMap = new Map<
            string,
            {
                topicId: string;
                topicName: string;
                scores: number[];
                attempts: number;
                solved: number;
            }
        >();

        submissions.forEach((s) => {
            if (!s.problem) return;

            const topicId =
                s.problem.topic?._id || s.problem.topic_id || "unknown";
            const topicName =
                s.problem.topic?.topic_name ||
                s.problem.topic?.name ||
                "Chưa có chủ đề";

            if (!topicMap.has(topicId)) {
                topicMap.set(topicId, {
                    topicId,
                    topicName,
                    scores: [],
                    attempts: 0,
                    solved: 0,
                });
            }

            const stat = topicMap.get(topicId)!;
            stat.attempts++;
            if (s.score !== null && s.score !== undefined) {
                stat.scores.push(Number(s.score));
            }
            if (s.status === SubmissionStatus.ACCEPTED) {
                stat.solved++;
            }
        });

        // Populate topic names từ database nếu cần
        const needsPopulate = Array.from(topicMap.entries()).filter(
            ([id, stat]) =>
                id !== "unknown" &&
                (stat.topicName === "Topic không tên" ||
                    stat.topicName === "Chưa có chủ đề"),
        );

        if (needsPopulate.length > 0) {
            const uniqueIds = Array.from(
                new Set(needsPopulate.map(([id]) => id)),
            );
            try {
                const topics = await this.topicsService.getMany(
                    user,
                    { _id: { $in: uniqueIds } } as any,
                    {
                        select: { topic_name: 1, _id: 1 },
                        enableDataPartition: false,
                        limit: uniqueIds.length,
                    } as any,
                );

                const topicNameMap = new Map(
                    topics
                        .filter((topic: any) => topic?._id && topic?.topic_name)
                        .map((topic: any) => [topic._id, topic.topic_name]),
                );

                needsPopulate.forEach(([id, stat]) => {
                    const resolvedName = topicNameMap.get(id);
                    if (resolvedName) {
                        stat.topicName = resolvedName;
                    }
                });
            } catch (error) {
                this.logger.warn(
                    `populateTopicNames failed: ${(error as Error)?.message}`,
                );
            }
        }

        // Chuyển đổi thành DTO
        const topicStats: TopicPerformanceDto[] = Array.from(
            topicMap.values(),
        ).map((stat) => ({
            topicId: stat.topicId,
            topicName: stat.topicName,
            averageScore:
                stat.scores.length > 0
                    ? stat.scores.reduce((a, b) => a + b, 0) /
                      stat.scores.length
                    : 0,
            completionRate:
                stat.attempts > 0 ? (stat.solved / stat.attempts) * 100 : 0,
            totalAttempts: stat.attempts,
            totalSolved: stat.solved,
        }));

        // Sắp xếp và lấy top/bottom
        topicStats.sort((a, b) => b.averageScore - a.averageScore);
        const strong = topicStats.slice(0, 5);
        const weak = topicStats.slice(-5).reverse();

        return { strong, weak };
    }

    private async calculateStudentRankings(
        user: User,
        studentIds: string[],
        submissions: any[],
    ): Promise<{ top: StudentRankingDto[]; bottom: StudentRankingDto[] }> {
        const studentMap = new Map<
            string,
            {
                studentId: string;
                totalSolved: number;
                totalSubmissions: number;
                scores: number[];
            }
        >();

        submissions.forEach((s) => {
            const sid = s.student_id;
            if (!studentMap.has(sid)) {
                studentMap.set(sid, {
                    studentId: sid,
                    totalSolved: 0,
                    totalSubmissions: 0,
                    scores: [],
                });
            }

            const stat = studentMap.get(sid)!;
            stat.totalSubmissions++;
            if (s.score !== null && s.score !== undefined) {
                stat.scores.push(Number(s.score));
            }
            if (s.status === SubmissionStatus.ACCEPTED) {
                stat.totalSolved++;
            }
        });

        // Lấy thông tin user
        const users = await this.userService.getMany(
            user,
            { _id: { $in: studentIds } } as any,
            {},
        );
        const userMap = new Map(
            users.map((u: any) => [
                u._id,
                { username: u.username, fullname: u.fullname },
            ]),
        );

        // Chuyển đổi thành DTO
        const rankings: StudentRankingDto[] = Array.from(studentMap.values())
            .map((stat) => {
                const userInfo = userMap.get(stat.studentId);
                return {
                    studentId: stat.studentId,
                    username: userInfo?.username || "Unknown",
                    fullname: userInfo?.fullname || "Unknown",
                    totalSolved: stat.totalSolved,
                    averageScore:
                        stat.scores.length > 0
                            ? stat.scores.reduce((a, b) => a + b, 0) /
                              stat.scores.length
                            : 0,
                    totalSubmissions: stat.totalSubmissions,
                };
            })
            .filter((r) => r.totalSubmissions > 0);

        // Sắp xếp theo totalSolved
        rankings.sort((a, b) => b.totalSolved - a.totalSolved);

        const top = rankings.slice(0, 5);
        const bottom = rankings.slice(-5).reverse();

        return { top, bottom };
    }

    private async calculateDifficultProblems(
        user: User,
        submissions: any[],
    ): Promise<ProblemDifficultyStatsDto[]> {
        const problemMap = new Map<
            string,
            {
                problemId: string;
                problemName: string;
                difficulty: number;
                attempts: number;
                passed: number;
            }
        >();

        submissions.forEach((s) => {
            if (!s.problem) return;

            const pid = s.problem_id;
            if (!problemMap.has(pid)) {
                problemMap.set(pid, {
                    problemId: pid,
                    problemName: s.problem.name || `Problem ${pid}`,
                    difficulty: s.problem.difficulty || 0,
                    attempts: 0,
                    passed: 0,
                });
            }

            const stat = problemMap.get(pid)!;
            stat.attempts++;
            if (s.status === SubmissionStatus.ACCEPTED) {
                stat.passed++;
            }
        });

        // Chuyển đổi thành DTO và tính fail rate
        const problems: ProblemDifficultyStatsDto[] = Array.from(
            problemMap.values(),
        )
            .map((stat) => ({
                problemId: stat.problemId,
                problemName: stat.problemName,
                difficulty: stat.difficulty,
                failRate:
                    stat.attempts > 0
                        ? ((stat.attempts - stat.passed) / stat.attempts) * 100
                        : 0,
                totalAttempts: stat.attempts,
                totalPassed: stat.passed,
            }))
            .filter((p) => p.totalAttempts >= 3) // Chỉ lấy bài có ít nhất 3 lần nộp
            .sort((a, b) => b.failRate - a.failRate) // Sắp xếp theo fail rate giảm dần
            .slice(0, 10); // Lấy top 10 bài khó nhất

        return problems;
    }

    private async generateClassAiAnalysis(
        stats: Omit<ClassOverviewDto, "aiAnalysisKmark">,
        submissions: any[],
    ): Promise<string> {
        const apiKey =
            process.env.OPENAI_KEY ||
            this.configService.get<string>("openai.key" as any);

        if (!apiKey) {
            return "## Phân tích AI\n- Không thể tạo phân tích vì thiếu OPENAI_KEY trong cấu hình.";
        }

        const model = "gpt-4o-mini";

        // Lấy random 3-5 code samples
        const codeSamples = submissions
            .filter((s) => s.code && s.code.length > 0)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((s) => ({
                problem: s.problem?.name || s.problem_id,
                difficulty: s.problem?.difficulty,
                status: s.status,
                score: s.score,
                code: s.code.slice(0, 500), // Giới hạn độ dài code
            }));

        const prompt = `Bạn là một chuyên gia phân tích giáo dục.
Dựa trên thống kê tổng quan của lớp học:
- Số bài đã giải trung bình mỗi học sinh
- Tỉ lệ giải được theo độ khó
- Tỉ lệ giải được theo chủ đề
- Danh sách học sinh top và bottom
- Lỗi thường gặp trong code của học sinh
- Các bài tập có tỉ lệ fail cao nhất

Hãy phân tích lớp học và trả về:
1. Mức độ hiệu suất tổng thể của lớp
2. Điểm mạnh của lớp
3. Điểm yếu của lớp
4. Lỗi thường gặp mà học sinh hay mắc phải
5. Chủ đề giáo viên nên dạy lại
6. Gợi ý bài tập luyện tập cho cả lớp
7. Học sinh cần được hỗ trợ đặc biệt
8. Học sinh đang làm tốt đặc biệt

Trả về bằng tiếng Việt, định dạng Kmark.`;

        const payload = {
            overallStats: stats.overallStats,
            strongTopics: stats.strongTopics,
            weakTopics: stats.weakTopics,
            topStudents: stats.topStudents,
            bottomStudents: stats.bottomStudents,
            difficultProblems: stats.difficultProblems,
            codeSamples,
        };

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model,
                    temperature: 0.2,
                    messages: [
                        {
                            role: "system",
                            content: prompt,
                        },
                        {
                            role: "user",
                            content: `Dữ liệu thống kê lớp học (JSON): ${JSON.stringify(payload)}`,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000,
                },
            );

            const content =
                response.data?.choices?.[0]?.message?.content?.trim();

            if (content) {
                return content;
            }

            return "## Phân tích AI\n- Không thể tạo phân tích từ OpenAI API.";
        } catch (error: any) {
            this.logger.error(
                `Error calling OpenAI API: ${error?.message || "Unknown error"}`,
            );
            return `## Phân tích AI\n- Lỗi khi gọi OpenAI API: ${error?.message || "Unknown error"}`;
        }
    }

    private getDifficultyName(difficulty: number): string {
        switch (difficulty) {
            case ProblemDifficulty.EASY:
                return "easy";
            case ProblemDifficulty.MEDIUM:
                return "medium";
            case ProblemDifficulty.NORMAL:
                return "normal";
            case ProblemDifficulty.HARD:
                return "hard";
            case ProblemDifficulty.VERY_HARD:
                return "very_hard";
            default:
                return "unknown";
        }
    }
}
