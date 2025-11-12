import { Module, forwardRef } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CourseStudentsController } from "./controller/course-students.controller";
import { CourseStudentsService } from "./services/course-students.service";
import { CourseStudent } from "@module/repository/sequelize/model/course-student";
import { RepositoryProvider } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { CourseStudentsSqlRepository } from "./repository/course-students-repository.sql";
import { CourseProblemsModule } from "@module/course-problems/course-problems.module";
import { StudentSubmissionsModule } from "@module/student-submissions/student-submissions.module";

@Module({
    imports: [
        SequelizeModule.forFeature([CourseStudent]),
        forwardRef(() => CourseProblemsModule),
        forwardRef(() => StudentSubmissionsModule),
    ],
    controllers: [CourseStudentsController],
    providers: [
        CourseStudentsService,
        RepositoryProvider(Entity.COURSE_STUDENT, CourseStudentsSqlRepository),
    ],
    exports: [CourseStudentsService],
})
export class CourseStudentsModule {}
