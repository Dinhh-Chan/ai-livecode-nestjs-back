import { StudentSubmissionsController } from "./controller/student-submissions.controller";
import { StudentSubmissionsService } from "./services/student-submissions.services";
import { StudentSubmissionsModel } from "./models/student-submissions.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { StudentSubmissionsRepositorySql } from "./repository/student-submissions-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([StudentSubmissionsModel])],
    controllers: [StudentSubmissionsController],
    providers: [
        StudentSubmissionsService,
        RepositoryProvider(
            Entity.STUDENT_SUBMISSIONS,
            StudentSubmissionsRepositorySql,
        ),
    ],
    exports: [StudentSubmissionsService],
})
export class StudentSubmissionsModule {}
