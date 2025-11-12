import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { CourseStudents } from "../entities/course-students.entity";

export interface CourseStudentsRepository
    extends BaseRepository<CourseStudents> {
    findByCourse(courseId: string): Promise<CourseStudents[]>;
    findByStudent(studentId: string): Promise<CourseStudents[]>;
}
