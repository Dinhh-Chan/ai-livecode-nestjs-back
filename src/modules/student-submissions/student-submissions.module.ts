import { StudentSubmissionsController } from "./controller/student-submissions.controller";
import { StudentSubmissionsService } from "./services/student-submissions.services";
import { StudentSubmissionsModel } from "./models/student-submissions.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentSubmissionsRepositorySql } from "./repository/student-submissions-repository.sql";
import { Judge0Service } from "@module/judge-nodes/services/judge0.service";
import { TestCasesModule } from "@module/test-cases/test-cases.module";
import { ProblemsModule } from "@module/problems/problems.module";
import { HttpModule } from "@nestjs/axios";
import { UserModule } from "@module/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([StudentSubmissionsModel]),
        HttpModule,
        TestCasesModule,
        ProblemsModule,
        UserModule,
    ],
    controllers: [StudentSubmissionsController],
    providers: [
        StudentSubmissionsService,
        Judge0Service,
        RepositoryProvider(
            Entity.STUDENT_SUBMISSIONS,
            StudentSubmissionsRepositorySql,
        ),
    ],
    exports: [StudentSubmissionsService],
})
export class StudentSubmissionsModule {}
