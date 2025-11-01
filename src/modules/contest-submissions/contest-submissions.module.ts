import { ContestSubmissionsController } from "./controller/contest-submissions.controller";
import { ContestSubmissionsService } from "./services/contest-submissions.services";
import { ContestSubmissionsModel } from "./models/contest-submissions.model";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestSubmissionsSqlRepository } from "./repository/contest-submissions-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([ContestSubmissionsModel])],
    controllers: [ContestSubmissionsController],
    providers: [
        ContestSubmissionsService,
        RepositoryProvider(
            Entity.CONTEST_SUBMISSIONS,
            ContestSubmissionsSqlRepository,
        ),
    ],
    exports: [ContestSubmissionsService],
})
export class ContestSubmissionsModule {}
