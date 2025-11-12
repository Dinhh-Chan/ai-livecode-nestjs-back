import { Module, forwardRef } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { RepositoryProvider } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { CourseProblemsController } from "./controller/course-problems.controller";
import { CourseProblemsService } from "./services/course-problems.service";
import { CourseProblemsSqlRepository } from "./repository/course-problems-repository.sql";
import { CourseProblemsModel } from "./models/course-problems.model";
import { ProblemsModule } from "@module/problems/problems.module";

@Module({
    imports: [
        SequelizeModule.forFeature([CourseProblemsModel]),
        forwardRef(() => ProblemsModule),
    ],
    controllers: [CourseProblemsController],
    providers: [
        CourseProblemsService,
        RepositoryProvider(Entity.COURSE_PROBLEMS, CourseProblemsSqlRepository),
    ],
    exports: [CourseProblemsService],
})
export class CourseProblemsModule {}
