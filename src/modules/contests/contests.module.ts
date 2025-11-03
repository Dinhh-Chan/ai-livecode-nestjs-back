import { ContestsController } from "./controller/contests.controller";
import { ContestsService } from "./services/contests.services";
import { ContestsModel } from "./models/contests.models";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestsRepositorySql } from "./repository/contests-repository.sql";
import { ContestUsersModule } from "@module/contest-users/contest-users.module";
import { ContestProblemsModule } from "@module/contest-problems/contest-problems.module";
import { ProblemsModule } from "@module/problems/problems.module";
import { UserModule } from "@module/user/user.module";
import { ContestSubmissionsModule } from "@module/contest-submissions/contest-submissions.module";

@Module({
    imports: [
        SequelizeModule.forFeature([ContestsModel]),
        forwardRef(() => ContestUsersModule),
        forwardRef(() => ContestProblemsModule),
        forwardRef(() => ProblemsModule),
        forwardRef(() => UserModule),
        forwardRef(() => ContestSubmissionsModule),
    ],
    controllers: [ContestsController],
    providers: [
        ContestsService,
        RepositoryProvider(Entity.CONTESTS, ContestsRepositorySql),
    ],
    exports: [ContestsService],
})
export class ContestsModule {}
