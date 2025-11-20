import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { User } from "@module/user/entities/user.entity";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Courses } from "../entities/courses.entity";
import { CoursesRepository } from "../repository/courses-repository.interface";
import { ApiError } from "@config/exception/api-error";
import { EnrollStudentDto } from "../dto/enroll-student.dto";
import { AssignTeacherDto, TeacherRole } from "../dto/assign-teacher.dto";
import { SelfEnrollDto } from "../dto/self-enroll.dto";
import { CourseStudentsService } from "@module/course-students/services/course-students.service";
import { CourseProblemsService } from "@module/course-problems/services/course-problems.service";
import { UserService } from "@module/user/service/user.service";
import { StudentSubmissionsService } from "@module/student-submissions/services/student-submissions.services";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";
import { GetByIdQuery } from "@common/constant";
import { ProblemsService } from "@module/problems/services/problems.services";
import { PopulationDto } from "@common/dto/population.dto";
import { Problems } from "@module/problems/entities/problems.entity";
import { SystemRole } from "@module/user/common/constant";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "@config/configuration";
import { Logger } from "@nestjs/common";
import axios from "axios";
import {
    GenerateAiCourseDto,
    GeneratedCourseDto,
    LearningGoal,
    LearningPathStepDto,
    AdviceDto,
} from "../dto/generate-ai-course.dto";

@Injectable()
export class CoursesService extends BaseService<Courses, CoursesRepository> {
    private readonly logger = new Logger(CoursesService.name);

    constructor(
        @InjectRepository(Entity.COURSES)
        private readonly coursesRepository: CoursesRepository,
        @InjectTransaction()
        private readonly coursesTransaction: BaseTransaction,
        @Inject(forwardRef(() => CourseStudentsService))
        private readonly courseStudentsService: CourseStudentsService,
        @Inject(forwardRef(() => CourseProblemsService))
        private readonly courseProblemsService: CourseProblemsService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => StudentSubmissionsService))
        private readonly studentSubmissionsService: StudentSubmissionsService,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
        private readonly configService: ConfigService<Configuration>,
    ) {
        super(coursesRepository, {
            notFoundCode: "error-user-not-found",
            transaction: coursesTransaction,
        });
    }

    async getCoursesByTeacher(user: User, teacherId: string) {
        // Note: Cần implement method riêng để query courses by teacher
        return [];
    }

    async getCoursesByStudent(user: User, studentId: string) {
        // Note: Cần implement method riêng để query courses by student
        return [];
    }

    async getActiveCourses(user: User) {
        // Lấy tất cả courses có is_public = true và is_active = true
        const publicCourses = await this.getMany(
            user,
            { is_public: true, is_active: true } as any,
            {} as any,
        );

        // Lấy courses có is_public = false, is_active = true mà user đã enrolled
        const allPrivateCourses = await this.getMany(
            user,
            { is_public: false, is_active: true } as any,
            {} as any,
        );

        // Kiểm tra user đã enrolled vào course nào
        const enrolledCourseIds = new Set<string>();
        if (allPrivateCourses.length > 0) {
            const courseIds = allPrivateCourses.map((c: any) => c._id);
            const enrollments = await this.courseStudentsService.getMany(
                user,
                {
                    course_id: { $in: courseIds },
                    student_id: user._id,
                } as any,
                {} as any,
            );
            enrollments.forEach((enrollment: any) => {
                enrolledCourseIds.add(enrollment.course_id);
            });
        }

        // Lọc các private courses mà user đã enrolled
        const enrolledPrivateCourses = allPrivateCourses.filter((course: any) =>
            enrolledCourseIds.has(course._id),
        );

        // Merge public courses và enrolled private courses, loại bỏ duplicate
        const allCourses = [...publicCourses, ...enrolledPrivateCourses];
        const uniqueCourses = Array.from(
            new Map(allCourses.map((c: any) => [c._id, c])).values(),
        );

        return uniqueCourses;
    }

    async getMyTeachingCourses(user: User) {
        // Note: Cần implement method riêng để query courses by teacher
        return [];
    }

    async getMyEnrolledCourses(user: User) {
        // Note: Cần implement method riêng để query courses by student
        return [];
    }

    async enrollStudent(user: User, courseId: string, dto: EnrollStudentDto) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra user có phải teacher của course này không
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isTeacher = courseTeachers.some((t) => t.teacher_id === user._id);

        if (!isTeacher && user.systemRole !== "Admin") {
            throw ApiError.Forbidden("error-forbidden");
        }

        // Enroll student
        return this.coursesRepository.enrollStudent(courseId, dto.studentId);
    }

    async assignTeacher(user: User, courseId: string, dto: AssignTeacherDto) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra user có quyền assign teacher không
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isMainTeacher = courseTeachers.some(
            (t) => t.teacher_id === user._id && t.role === TeacherRole.MAIN,
        );

        if (!isMainTeacher && user.systemRole !== "Admin") {
            throw ApiError.Forbidden("error-forbidden");
        }

        // Assign teacher
        return this.coursesRepository.assignTeacher(
            courseId,
            dto.teacherId,
            dto.role,
        );
    }

    async selfEnroll(user: User, courseId: string, dto: SelfEnrollDto) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Verify course code nếu có
        if (dto.courseCode && course.course_code !== dto.courseCode) {
            throw ApiError.BadRequest("error-setting-value-invalid");
        }

        // Kiểm tra course có cho phép self-enroll không (có thể thêm field này vào entity)
        if (!course.is_active) {
            throw ApiError.Forbidden("error-forbidden");
        }

        // Enroll student
        return this.coursesRepository.enrollStudent(courseId, user._id);
    }

    async getCourseStudents(user: User, courseId: string) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra quyền truy cập
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isTeacher = courseTeachers.some((t) => t.teacher_id === user._id);
        // Note: Cần implement method riêng để check student enrollment
        const isStudent = false;

        if (!isTeacher && !isStudent && user.systemRole !== "Admin") {
            throw ApiError.Forbidden("error-forbidden");
        }

        return this.coursesRepository.getCourseStudents(courseId);
    }

    async getCourseTeachers(user: User, courseId: string) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        return this.coursesRepository.getCourseTeachers(courseId);
    }

    async removeStudentFromCourse(
        user: User,
        courseId: string,
        studentId: string,
    ) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra quyền
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isTeacher = courseTeachers.some((t) => t.teacher_id === user._id);

        if (!isTeacher && user.systemRole !== "Admin") {
            throw ApiError.Forbidden("error-forbidden");
        }

        return this.coursesRepository.removeStudentFromCourse(
            courseId,
            studentId,
        );
    }

    async removeTeacherFromCourse(
        user: User,
        courseId: string,
        teacherId: string,
    ) {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra quyền
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isMainTeacher = courseTeachers.some(
            (t) => t.teacher_id === user._id && t.role === TeacherRole.MAIN,
        );

        if (!isMainTeacher && user.systemRole !== "Admin") {
            throw ApiError.Forbidden("error-forbidden");
        }

        return this.coursesRepository.removeTeacherFromCourse(
            courseId,
            teacherId,
        );
    }

    /**
     * Override getById để trả về thêm thông tin students và problems
     */
    async getById(
        user: User,
        id: string,
        query?: GetByIdQuery<Courses> & any,
    ): Promise<any> {
        // Lấy thông tin course cơ bản
        const course = await super.getById(user, id, query);
        if (!course) {
            return null;
        }

        // Lấy danh sách students với thông tin user
        const courseStudents =
            await this.courseStudentsService.findByCourse(id);
        const studentIds = courseStudents.map((cs) => cs.student_id);

        // Kiểm tra user hiện tại đã join course chưa
        const isJoined = studentIds.includes(user._id);

        let students: any[] = [];
        if (studentIds.length > 0) {
            // Lấy tất cả users cùng lúc
            const studentUsers = await this.userService.getMany(
                user,
                { _id: { $in: studentIds } } as any,
                {},
            );
            const userMap = new Map(studentUsers.map((u: any) => [u._id, u]));
            students = courseStudents.map((cs) => {
                const studentUser = userMap.get(cs.student_id);
                return {
                    _id: cs.student_id,
                    username: studentUser?.username,
                    fullname: studentUser?.fullname,
                    email: studentUser?.email,
                    join_at: cs.join_at,
                };
            });
        }

        // Lấy danh sách problems với thông tin chi tiết (đã sắp xếp theo order_index)
        const problems = await this.courseProblemsService.findWithDetails(
            user,
            id,
            false, // không bao gồm bài ẩn
        );

        const totalProblems = problems.length;
        const problemIds = problems.map((p: any) => p.problem_id);

        // Tính số bài đã hoàn thành cho mỗi student
        const studentsWithProgress = await Promise.all(
            students.map(async (student) => {
                if (!problemIds.length) {
                    return {
                        ...student,
                        completed_problems: 0,
                        total_problems: 0,
                    };
                }

                // Lấy tất cả submissions ACCEPTED của student cho các problems trong course
                const acceptedSubmissions =
                    await this.studentSubmissionsService.getMany(
                        user,
                        {
                            student_id: student._id,
                            problem_id: { $in: problemIds } as any,
                            status: SubmissionStatus.ACCEPTED,
                        } as any,
                        {},
                    );

                // Đếm số bài unique đã hoàn thành (mỗi problem chỉ tính 1 lần)
                const completedProblemIds = new Set(
                    acceptedSubmissions.map((s: any) => s.problem_id),
                );
                const completedProblems = completedProblemIds.size;

                return {
                    ...student,
                    completed_problems: completedProblems,
                    total_problems: totalProblems,
                };
            }),
        );

        return {
            ...course,
            is_joined: isJoined,
            students: studentsWithProgress,
            problems,
        };
    }

    /**
     * Lấy thông tin chi tiết một problem trong course
     */
    async getProblemInCourse(
        user: User,
        courseId: string,
        problemId: string,
    ): Promise<any> {
        // Kiểm tra course có tồn tại không
        const course = await this.coursesRepository.getById(courseId);
        if (!course) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra problem có trong course không
        const courseProblems = await this.courseProblemsService.findByCourse(
            courseId,
            true, // include hidden để kiểm tra
        );
        const courseProblem = courseProblems.find(
            (cp) => cp.problem_id === problemId,
        );

        if (!courseProblem) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Kiểm tra nếu problem không hiển thị và user không phải teacher/admin
        const courseTeachers =
            await this.coursesRepository.getCourseTeachers(courseId);
        const isTeacher = courseTeachers.some((t) => t.teacher_id === user._id);
        const isAdmin = user.systemRole === SystemRole.ADMIN;

        if (courseProblem.is_visible === false && !isTeacher && !isAdmin) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Lấy thông tin chi tiết của problem với population
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];

        const problem = await this.problemsService.getById(user, problemId, {
            population,
        });

        if (!problem) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Nếu user là STUDENT, kiểm tra problem có is_public = true
        if (user?.systemRole === SystemRole.STUDENT && !problem.is_public) {
            throw ApiError.NotFound("error-user-not-found");
        }

        // Trả về kết hợp thông tin course-problem và problem
        return {
            ...problem,
            order_index: courseProblem.order_index,
            is_visible: courseProblem.is_visible,
            is_required: courseProblem.is_required,
            course_id: courseId,
        };
    }

    async generateAiCourse(
        user: User,
        dto: GenerateAiCourseDto,
    ): Promise<GeneratedCourseDto> {
        this.logger.log(`Generating AI course for user ${user._id}`);

        // Lấy user overview
        const userOverview = await this.userService.getUserOverview(user);

        // Lấy danh sách problems có sẵn
        const allProblems = await this.problemsService.getMany(
            user,
            { is_active: true, is_public: true } as any,
            { limit: 1000 } as any,
        );

        // Lấy danh sách topics - cần inject TopicsService hoặc lấy từ Problems
        // Tạm thời lấy từ problems
        const topicsSet = new Set<string>();
        allProblems.forEach((p: any) => {
            if (p.topic?.topic_name) {
                topicsSet.add(p.topic.topic_name);
            } else if (p.topic?.name) {
                topicsSet.add(p.topic.name);
            }
        });
        const topicsList = Array.from(topicsSet);

        // Gọi OpenAI để tạo lộ trình
        const aiResponse = await this.generateLearningPathWithAI(
            userOverview,
            allProblems,
            topicsList,
            dto.learning_goal,
            dto.additional_notes,
        );

        // Tạo course mới
        // course_code có giới hạn 20 ký tự, format: AI_<timestamp_short><random>
        const timestamp = Date.now().toString().slice(-8); // Lấy 8 số cuối của timestamp
        const random = Math.random().toString(36).substr(2, 6); // 6 ký tự random
        const courseCode = `AI_${timestamp}${random}`.substring(0, 20); // Đảm bảo không vượt quá 20 ký tự
        const course = await this.create(user, {
            course_name: aiResponse.course_name || "Khóa học AI được đề xuất",
            course_code: courseCode,
            description: aiResponse.summary || aiResponse.description || "",
            is_active: true,
            is_public: false, // Mặc định là false
        } as any);

        // Thêm problems vào course
        const allProblemIds: string[] = [];
        aiResponse.learning_path.forEach((step, index) => {
            step.recommended_problems.forEach((problemId) => {
                if (!allProblemIds.includes(problemId)) {
                    allProblemIds.push(problemId);
                }
            });
        });

        // Lấy thêm problems để đủ 30-40 bài (nếu chưa đủ)
        const targetProblemCount = 35; // Mục tiêu 30-40 bài
        if (allProblemIds.length < targetProblemCount) {
            // Lấy thêm problems từ danh sách có sẵn, ưu tiên các chủ đề yếu
            const weakTopics =
                userOverview.layer2?.weakTopics
                    ?.map((t: any) => t.topicName)
                    .slice(0, 3) || [];

            const additionalProblems = allProblems
                .filter((p: any) => {
                    // Chưa có trong danh sách
                    if (allProblemIds.includes(p._id)) return false;
                    // Ưu tiên các chủ đề yếu
                    const topicName =
                        p.topic?.topic_name || p.topic?.name || "";
                    return weakTopics.some((wt: string) =>
                        topicName.toLowerCase().includes(wt.toLowerCase()),
                    );
                })
                .slice(0, targetProblemCount - allProblemIds.length);

            additionalProblems.forEach((p: any) => {
                if (!allProblemIds.includes(p._id)) {
                    allProblemIds.push(p._id);
                }
            });
        }

        // Giới hạn tối đa 40 bài
        const finalProblemIds = allProblemIds.slice(0, 40);

        // Thêm problems vào course với order_index
        for (let i = 0; i < finalProblemIds.length; i++) {
            const problemId = finalProblemIds[i];
            // Kiểm tra problem có tồn tại không
            const problem = allProblems.find((p: any) => p._id === problemId);
            if (problem) {
                await this.courseProblemsService.create(user, {
                    course_id: course._id,
                    problem_id: problemId,
                    order_index: i + 1,
                    is_visible: true,
                    is_required: true,
                } as any);
            }
        }

        // Lấy thông tin đầy đủ của problems
        const problemsWithDetails = finalProblemIds
            .map((problemId) => {
                const problem = allProblems.find(
                    (p: any) => p._id === problemId,
                );
                if (!problem) return null;
                return {
                    problem_id: problem._id,
                    name: problem.name,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    topic_name:
                        problem.topic?.topic_name || problem.topic?.name,
                    sub_topic_name: problem.sub_topic?.sub_topic_name,
                };
            })
            .filter(Boolean);

        // Tạo nhận xét về người dùng từ advice
        const userAssessment = this.createUserAssessment(
            aiResponse.advice,
            userOverview,
        );

        return {
            course_id: course._id,
            course_name: course.course_name,
            course_code: course.course_code,
            description: course.description || "",
            is_public: course.is_public || false,
            problem_ids: finalProblemIds,
            problems: problemsWithDetails,
            advice: aiResponse.advice,
            user_assessment: userAssessment,
            learning_path: aiResponse.learning_path,
            summary: aiResponse.summary,
            estimated_total_time: aiResponse.estimated_total_time,
        };
    }

    private async generateLearningPathWithAI(
        userOverview: any,
        problems: any[],
        topics: string[],
        learningGoal: LearningGoal,
        additionalNotes?: string,
    ): Promise<{
        course_name: string;
        description: string;
        summary: string;
        estimated_total_time: string;
        advice: AdviceDto;
        learning_path: LearningPathStepDto[];
    }> {
        const apiKey =
            process.env.OPENAI_KEY ||
            this.configService.get<string>("openai.key" as any);

        if (!apiKey) {
            throw new Error("OPENAI_KEY không được cấu hình");
        }

        const model = "gpt-4o-mini";

        // Chuẩn bị dữ liệu
        const problemsByDifficulty =
            userOverview.layer1?.solvedByDifficulty || {};
        const totalCorrect = Number(
            Object.values(problemsByDifficulty).reduce(
                (a: any, b: any) => Number(a) + Number(b),
                0,
            ) || 0,
        );
        const avgSubmissions = Number(
            userOverview.layer1?.averageSubmissionsPerProblem || 0,
        );
        const totalWrong = Math.max(
            0,
            avgSubmissions * totalCorrect - totalCorrect,
        );
        const totalAttempts = totalCorrect + totalWrong;
        const accuracyRate =
            totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        const strongTopics =
            userOverview.layer2?.strengthTopics
                ?.map((t: any) => t.topicName)
                .slice(0, 5) || [];
        const weakTopics =
            userOverview.layer2?.weakTopics
                ?.map((t: any) => t.topicName)
                .slice(0, 5) || [];

        // Format problems
        const problemsList = problems.slice(0, 50).map((p: any) => ({
            problem_id: p._id,
            title: p.name,
            topic: p.topic?.topic_name || p.topic?.name || "Chưa có chủ đề",
            difficulty: this.getDifficultyName(p.difficulty),
        }));

        const topicsListFormatted = topics.slice(0, 20);

        const goalDescriptions: Record<LearningGoal, string> = {
            [LearningGoal.INTERVIEW]:
                "Học để phỏng vấn - tập trung vào các bài toán phỏng vấn phổ biến, kỹ thuật giải quyết vấn đề, và coding interview patterns",
            [LearningGoal.ICPC_CONTEST]:
                "Học để thi ICPC/Contest - tập trung vào các thuật toán nâng cao, tối ưu hóa, và kỹ năng giải bài trong thời gian giới hạn",
            [LearningGoal.UNDERSTAND_ALGORITHM]:
                "Học để hiểu thuật toán - tập trung vào việc hiểu sâu các thuật toán cơ bản và nâng cao, cách hoạt động và ứng dụng",
            [LearningGoal.CAREER_CHANGE]:
                "Học để chuyển ngành cấp tốc - lộ trình nhanh, tập trung vào các kiến thức cốt lõi và thực hành nhiều",
            [LearningGoal.REINFORCE_OOP_DSA]:
                "Học để củng cố OOP/DSA cho công việc - tập trung vào cấu trúc dữ liệu, thuật toán thực tế và design patterns",
        };

        const prompt = `Bạn là một chuyên gia tư vấn học tập về lập trình và thuật toán.
Nhiệm vụ của bạn là phân tích năng lực hiện tại của người học và tạo ra một lộ trình học tập phù hợp.

## THÔNG TIN NGƯỜI HỌC:

### Năng lực hiện tại:
- Số bài đã làm theo mức độ: ${JSON.stringify(problemsByDifficulty)}
- Tổng số bài đúng: ${totalCorrect}
- Tổng số bài sai: ${totalWrong}
- Tỷ lệ đúng: ${accuracyRate.toFixed(2)}%
- Số lần submit trung bình trước AC: ${userOverview.layer1?.averageSubmissionsPerProblem || 0}
- Chủ đề mạnh: ${strongTopics.join(", ") || "Chưa xác định"}
- Chủ đề yếu: ${weakTopics.join(", ") || "Chưa xác định"}

### Mục tiêu học tập:
${goalDescriptions[learningGoal]}

### Thông tin cơ sở dữ liệu bài tập:
- Tổng số bài: ${problems.length}
- Các chủ đề có sẵn: ${topicsListFormatted.join(", ")}
- Danh sách bài tập mẫu:
${problemsList.map((p: any) => `- ${p.problem_id}: ${p.title} (${p.topic}, ${p.difficulty})`).join("\n")}

### Ghi chú thêm:
${additionalNotes || "Không có"}

## YÊU CẦU:

Hãy tạo một lộ trình học tập chi tiết và lời khuyên phù hợp. Trả về JSON với format sau (chỉ JSON thuần, không có markdown):

{
  "course_name": "Tên khóa học",
  "description": "Mô tả khóa học",
  "summary": "Tóm tắt lộ trình",
  "estimated_total_time": "3 tháng",
  "advice": {
    "general_advice": "Lời khuyên chung",
    "strengths_to_leverage": ["điểm mạnh 1", "điểm mạnh 2"],
    "weaknesses_to_improve": ["điểm yếu 1", "điểm yếu 2"],
    "study_tips": ["mẹo 1", "mẹo 2"]
  },
  "learning_path": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "description": "Mô tả chi tiết",
      "recommended_problems": ["problem_id1", "problem_id2"],
      "topics_to_focus": ["chủ đề 1"],
      "estimated_time": "2 tuần"
    }
  ]
}

Lưu ý: recommended_problems phải là các problem_id có trong danh sách bài tập mẫu ở trên.`;

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model,
                    temperature: 0.7,
                    messages: [
                        {
                            role: "system",
                            content:
                                "Bạn là chuyên gia tư vấn học tập. Trả về kết quả bằng tiếng Việt, chỉ trả về JSON thuần không có markdown code block.",
                        },
                        {
                            role: "user",
                            content: prompt,
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

            if (!content) {
                throw new Error("Không nhận được response từ OpenAI");
            }

            // Parse JSON từ response
            let jsonData: any;
            try {
                // Loại bỏ markdown code blocks nếu có
                const cleanedContent = content
                    .replace(/```json\s*/g, "")
                    .replace(/```\s*/g, "")
                    .trim();
                jsonData = JSON.parse(cleanedContent);
            } catch (parseError) {
                // Thử extract JSON từ text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error(
                        `Không thể parse JSON từ response: ${content.substring(0, 200)}`,
                    );
                }
            }

            return {
                course_name: jsonData.course_name || "Khóa học AI được đề xuất",
                description: jsonData.description || "",
                summary: jsonData.summary || "",
                estimated_total_time:
                    jsonData.estimated_total_time || "Không xác định",
                advice: jsonData.advice || {
                    general_advice: "",
                    strengths_to_leverage: [],
                    weaknesses_to_improve: [],
                    study_tips: [],
                },
                learning_path: jsonData.learning_path || [],
            };
        } catch (error: any) {
            this.logger.error(
                `Error calling OpenAI API: ${error?.message || "Unknown error"}`,
            );
            throw new Error(
                `Lỗi khi tạo lộ trình học: ${error?.message || "Unknown error"}`,
            );
        }
    }

    private getDifficultyName(difficulty: number): string {
        switch (difficulty) {
            case 1:
                return "easy";
            case 2:
                return "medium";
            case 3:
                return "normal";
            case 4:
                return "hard";
            case 5:
                return "very_hard";
            default:
                return "unknown";
        }
    }

    private createUserAssessment(advice: AdviceDto, userOverview: any): string {
        const parts: string[] = [];

        // Đánh giá tổng quan
        if (advice.general_advice) {
            parts.push(advice.general_advice);
        }

        // Điểm mạnh
        if (
            advice.strengths_to_leverage &&
            advice.strengths_to_leverage.length > 0
        ) {
            parts.push(
                `\n\nĐiểm mạnh của bạn:\n${advice.strengths_to_leverage
                    .map((s) => `- ${s}`)
                    .join("\n")}`,
            );
        }

        // Điểm yếu cần cải thiện
        if (
            advice.weaknesses_to_improve &&
            advice.weaknesses_to_improve.length > 0
        ) {
            parts.push(
                `\n\nĐiểm cần cải thiện:\n${advice.weaknesses_to_improve
                    .map((w) => `- ${w}`)
                    .join("\n")}`,
            );
        }

        // Thống kê
        const accuracy = Number(userOverview.layer1?.accuracy || 0);
        const solvedByDifficulty =
            userOverview.layer1?.solvedByDifficulty || {};
        const totalSolved = Number(
            Object.values(solvedByDifficulty).reduce(
                (a: any, b: any) => Number(a) + Number(b),
                0,
            ),
        );

        if (totalSolved > 0) {
            parts.push(
                `\n\nThống kê hiện tại:\n- Tổng số bài đã giải: ${totalSolved}\n- Tỉ lệ đúng: ${accuracy.toFixed(2)}%`,
            );
        }

        return parts.join("");
    }
}
