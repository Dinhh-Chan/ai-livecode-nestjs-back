import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { InjectRepository } from "@module/repository/common/repository";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { CourseStudents } from "../entities/course-students.entity";
import { CourseStudentsRepository } from "../repository/course-students-repository.interface";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ApiError } from "@config/exception/api-error";
import { CreateCourseStudentDto } from "../dto/create-course-student.dto";
import { CourseProblemsService } from "@module/course-problems/services/course-problems.service";
import { StudentSubmissionsRepository } from "@module/student-submissions/repository/student-submissions-repository.interface";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";

@Injectable()
export class CourseStudentsService extends BaseService<
    CourseStudents,
    CourseStudentsRepository
> {
    constructor(
        @InjectRepository(Entity.COURSE_STUDENT)
        private readonly courseStudentsRepository: CourseStudentsRepository,
        @Inject(forwardRef(() => CourseProblemsService))
        private readonly courseProblemsService: CourseProblemsService,
        @InjectRepository(Entity.STUDENT_SUBMISSIONS)
        private readonly studentSubmissionsRepository: StudentSubmissionsRepository,
    ) {
        super(courseStudentsRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<CourseStudents>,
    ): Promise<CourseStudents[]> {
        const withSort = {
            ...query,
            sort: query?.sort || { join_at: 1 },
        };
        return super.getMany(user, conditions, withSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<CourseStudents>,
    ): Promise<any> {
        const withSort = {
            ...query,
            sort: query?.sort || { join_at: 1 },
        };
        return super.getPage(user, conditions, withSort);
    }

    findByCourse(courseId: string) {
        return this.courseStudentsRepository.findByCourse(courseId);
    }

    findByStudent(studentId: string) {
        return this.courseStudentsRepository.findByStudent(studentId);
    }

    /**
     * Tự tham gia khóa học (join course)
     */
    async joinCourse(user: User, courseId: string): Promise<CourseStudents> {
        // Kiểm tra đã tham gia chưa
        const existing = await this.getOne(
            user,
            { course_id: courseId, student_id: user._id } as any,
            {},
        );

        if (existing) {
            throw ApiError.BadRequest("error-setting-value-invalid", {
                message: "Bạn đã tham gia khóa học này rồi",
            });
        }

        // Tạo record mới
        const dto: CreateCourseStudentDto = {
            course_id: courseId,
            student_id: user._id,
            join_at: new Date(),
        };

        return this.create(user, dto as any);
    }

    /**
     * Lấy tiến trình làm bài của học viên trong khóa học
     */
    async getProgress(
        user: User,
        courseId: string,
        studentId: string,
    ): Promise<{
        course_id: string;
        student_id: string;
        total_problems: number;
        completed_problems: number;
        in_progress_problems: number;
        not_started_problems: number;
        problems: Array<{
            problem_id: string;
            problem: any;
            status: "completed" | "in_progress" | "not_started";
            best_score?: number;
            last_submission?: any;
        }>;
    }> {
        // Lấy danh sách bài tập trong khóa học
        const courseProblems = await this.courseProblemsService.findByCourse(
            courseId,
            false, // không bao gồm bài ẩn
        );

        if (!courseProblems.length) {
            return {
                course_id: courseId,
                student_id: studentId,
                total_problems: 0,
                completed_problems: 0,
                in_progress_problems: 0,
                not_started_problems: 0,
                problems: [],
            };
        }

        // Lấy thông tin chi tiết bài tập
        const problems = await this.courseProblemsService.findWithDetails(
            user,
            courseId,
            false,
        );

        // Lấy submissions của học viên cho các bài tập trong khóa học
        const problemsWithProgress = await Promise.all(
            problems.map(async (cp: any) => {
                const submissions =
                    await this.studentSubmissionsRepository.findByStudentAndProblem(
                        studentId,
                        cp.problem_id,
                        100, // lấy nhiều submissions để tìm best submission
                    );

                // Tìm submission ACCEPTED tốt nhất (score cao nhất)
                const acceptedSubmissions = submissions.filter(
                    (s) => s.status === SubmissionStatus.ACCEPTED,
                );
                const bestSubmission =
                    acceptedSubmissions.length > 0
                        ? acceptedSubmissions.reduce((best, current) =>
                              (current.score || 0) > (best.score || 0)
                                  ? current
                                  : best,
                          )
                        : null;
                const lastSubmission = submissions[0] || null;

                let status: "completed" | "in_progress" | "not_started" =
                    "not_started";
                if (bestSubmission) {
                    status = "completed";
                } else if (lastSubmission) {
                    status = "in_progress";
                }

                return {
                    problem_id: cp.problem_id,
                    problem: cp.problem,
                    status,
                    best_score:
                        bestSubmission?.score || lastSubmission?.score || 0,
                    last_submission: lastSubmission || null,
                };
            }),
        );

        const completed = problemsWithProgress.filter(
            (p) => p.status === "completed",
        ).length;
        const inProgress = problemsWithProgress.filter(
            (p) => p.status === "in_progress",
        ).length;
        const notStarted = problemsWithProgress.filter(
            (p) => p.status === "not_started",
        ).length;

        return {
            course_id: courseId,
            student_id: studentId,
            total_problems: problemsWithProgress.length,
            completed_problems: completed,
            in_progress_problems: inProgress,
            not_started_problems: notStarted,
            problems: problemsWithProgress,
        };
    }
}
