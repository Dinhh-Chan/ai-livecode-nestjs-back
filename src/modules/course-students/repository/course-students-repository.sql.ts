import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ModelCtor } from "sequelize-typescript";
import { CourseStudents } from "../entities/course-students.entity";
import { CourseStudentsRepository } from "./course-students-repository.interface";
import { CourseStudent } from "@module/repository/sequelize/model/course-student";

export class CourseStudentsSqlRepository
    extends SqlRepository<CourseStudents>
    implements CourseStudentsRepository
{
    constructor(
        @InjectModel(CourseStudent)
        private readonly courseStudentModel: ModelCtor<CourseStudent>,
    ) {
        super(courseStudentModel);
    }

    findByCourse(courseId: string): Promise<CourseStudents[]> {
        return this.getMany({ course_id: courseId } as any, {
            sort: { join_at: 1 },
        });
    }

    findByStudent(studentId: string): Promise<CourseStudents[]> {
        return this.getMany({ student_id: studentId } as any, {
            sort: { join_at: 1 },
        });
    }
}
