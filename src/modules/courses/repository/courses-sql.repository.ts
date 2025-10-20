import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { Courses } from "../entities/courses.entity";
import { CoursesRepository } from "./courses-repository.interface";
import { Entity } from "@module/repository";
import { CourseStudent } from "@module/repository/sequelize/model/course-student";
import { CourseTeacher } from "@module/repository/sequelize/model/course-teacher";
import { ApiError } from "@config/exception/api-error";

export class CoursesSqlRepository
    extends SqlRepository<Courses>
    implements CoursesRepository
{
    async getCoursesByTeacher(teacherId: string): Promise<Courses[]> {
        // Note: Cần implement method riêng để query courses by teacher
        return [];
    }

    async getCoursesByStudent(studentId: string): Promise<Courses[]> {
        // Note: Cần implement method riêng để query courses by student
        return [];
    }

    async getActiveCourses(): Promise<Courses[]> {
        return this.getMany({ is_active: true });
    }

    async enrollStudent(courseId: string, studentId: string): Promise<any> {
        // Kiểm tra student đã enroll chưa
        // Note: Cần implement method riêng để check enrollment
        const existingEnrollment = null;

        if (existingEnrollment) {
            throw ApiError.BadRequest("error-user-exist");
        }

        // Tạo enrollment record
        const enrollmentData = {
            _id: this.generateId(),
            course_id: courseId,
            student_id: studentId,
            enrolled_at: new Date(),
        };

        // Insert vào course_students table
        // Note: Cần implement method riêng cho việc tạo enrollment
        return enrollmentData;
    }

    async assignTeacher(
        courseId: string,
        teacherId: string,
        role: string = "main",
    ): Promise<any> {
        // Kiểm tra teacher đã được assign chưa
        // Note: Cần implement method riêng để check assignment
        const existingAssignment = null;

        if (existingAssignment) {
            throw ApiError.BadRequest("error-user-exist");
        }

        // Tạo assignment record
        const assignmentData = {
            _id: this.generateId(),
            course_id: courseId,
            teacher_id: teacherId,
            role,
            assigned_at: new Date(),
        };

        // Insert vào course_teachers table
        // Note: Cần implement method riêng cho việc tạo assignment
        return assignmentData;
    }

    async getCourseStudents(courseId: string): Promise<any[]> {
        // Note: Cần implement method riêng để query course_students table
        return [];
    }

    async getCourseTeachers(courseId: string): Promise<any[]> {
        // Note: Cần implement method riêng để query course_teachers table
        return [];
    }

    async removeStudentFromCourse(
        courseId: string,
        studentId: string,
    ): Promise<boolean> {
        // Note: Cần implement method riêng để delete từ course_students table
        return true;
    }

    async removeTeacherFromCourse(
        courseId: string,
        teacherId: string,
    ): Promise<boolean> {
        // Note: Cần implement method riêng để delete từ course_teachers table
        return true;
    }

    private generateId(): string {
        return (
            Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
        );
    }
}
