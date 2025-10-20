import { BaseService } from "@config/service/base.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { User } from "@module/user/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { Courses } from "../entities/courses.entity";
import { CoursesRepository } from "../repository/courses-repository.interface";
import { ApiError } from "@config/exception/api-error";
import { EnrollStudentDto } from "../dto/enroll-student.dto";
import { AssignTeacherDto, TeacherRole } from "../dto/assign-teacher.dto";
import { SelfEnrollDto } from "../dto/self-enroll.dto";

@Injectable()
export class CoursesService extends BaseService<Courses, CoursesRepository> {
    constructor(
        @InjectRepository(Entity.COURSES)
        private readonly coursesRepository: CoursesRepository,
        @InjectTransaction()
        private readonly coursesTransaction: BaseTransaction,
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
        return this.coursesRepository.getActiveCourses();
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
}
