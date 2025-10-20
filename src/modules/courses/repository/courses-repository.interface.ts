import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Courses } from "../entities/courses.entity";

export interface CoursesRepository extends BaseRepository<Courses> {
    getCoursesByTeacher(teacherId: string): Promise<Courses[]>;
    getCoursesByStudent(studentId: string): Promise<Courses[]>;
    getActiveCourses(): Promise<Courses[]>;
    enrollStudent(courseId: string, studentId: string): Promise<any>;
    assignTeacher(
        courseId: string,
        teacherId: string,
        role?: string,
    ): Promise<any>;
    getCourseStudents(courseId: string): Promise<any[]>;
    getCourseTeachers(courseId: string): Promise<any[]>;
    removeStudentFromCourse(
        courseId: string,
        studentId: string,
    ): Promise<boolean>;
    removeTeacherFromCourse(
        courseId: string,
        teacherId: string,
    ): Promise<boolean>;
}
