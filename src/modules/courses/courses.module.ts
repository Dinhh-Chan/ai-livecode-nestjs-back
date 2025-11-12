import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { Module, forwardRef } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CoursesController } from "./controller/courses.controller";
import { CoursesModel } from "./models/courses.model";
import { CoursesService } from "./services/courses.service";
import { CoursesImportService } from "./services/courses-import.service";
import { CoursesSqlRepository } from "./repository/courses-sql.repository";
import { CourseStudentsModule } from "@module/course-students/course-students.module";
import { CourseProblemsModule } from "@module/course-problems/course-problems.module";
import { UserModule } from "@module/user/user.module";
import { StudentSubmissionsModule } from "@module/student-submissions/student-submissions.module";

@Module({
    imports: [
        SequelizeModule.forFeature([CoursesModel]),
        forwardRef(() => CourseStudentsModule),
        forwardRef(() => CourseProblemsModule),
        forwardRef(() => UserModule),
        forwardRef(() => StudentSubmissionsModule),
    ],
    controllers: [CoursesController],
    providers: [
        CoursesService,
        RepositoryProvider(Entity.COURSES, CoursesSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    exports: [CoursesService],
})
export class CoursesModule {}
