import { UserProblemProgressController } from "./controller/user-problem-progress.controller";
import {
    UserProblemProgressService,
    USER_PROBLEM_PROGRESS_REPOSITORY_TOKEN,
} from "./services/user-problem-progress.service";
import { UserProblemProgressModel } from "./models/user-problem-progress.model";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserProblemProgressRepositorySql } from "./repository/user-problem-progress-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([UserProblemProgressModel])],
    controllers: [UserProblemProgressController],
    providers: [
        UserProblemProgressService,
        {
            provide: USER_PROBLEM_PROGRESS_REPOSITORY_TOKEN,
            useClass: UserProblemProgressRepositorySql,
        },
        RepositoryProvider(
            Entity.USER_PROBLEM_PROGRESS,
            UserProblemProgressRepositorySql,
        ),
    ],
    exports: [UserProblemProgressService],
})
export class UserProblemProgressModule {}
