import { ContestSubmissionsController } from "./controller/contest-submissions.controller";
import { ContestSubmissionsService } from "./services/contest-submissions.services";
import { ContestSubmissionsModel } from "./models/contest-submissions.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestSubmissionsSqlRepository } from "./repository/contest-submissions-repository.sql";
import { StudentSubmissionsModule } from "@module/student-submissions/student-submissions.module";
import { ContestUsersModule } from "@module/contest-users/contest-users.module";
import { ContestsModule } from "@module/contests/contests.module";
import { UserModule } from "@module/user/user.module";
import { ProblemsModule } from "@module/problems/problems.module";

@Module({
    imports: [
        SequelizeModule.forFeature([ContestSubmissionsModel]),
        forwardRef(() => StudentSubmissionsModule),
        forwardRef(() => ContestUsersModule),
        forwardRef(() => ContestsModule),
        forwardRef(() => UserModule),
        forwardRef(() => ProblemsModule),
    ],
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
