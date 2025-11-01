import { ProblemsController } from "./controller/problems.controller";
import { ProblemsService } from "./services/problems.services";
import { ProblemsCountService } from "./services/problems-count.service";
import { ProblemsModel } from "./models/problems.models";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProblemsRepositorySql } from "./repository/problems-repository.sql";
import { TestCasesModule } from "../test-cases/test-cases.module";
import { UserProblemProgressModule } from "@module/user-problem-progress/user-problem-progress.module";
import { UserProblemProgressRepositorySql } from "@module/user-problem-progress/repository/user-problem-progress-repository.sql";
import { UserProblemProgressModel } from "@module/user-problem-progress/models/user-problem-progress.model";

@Module({
    imports: [
        SequelizeModule.forFeature([ProblemsModel, UserProblemProgressModel]),
        TestCasesModule,
        forwardRef(() => UserProblemProgressModule),
    ],
    controllers: [ProblemsController],
    providers: [
        ProblemsService,
        ProblemsCountService,
        RepositoryProvider(Entity.PROBLEMS, ProblemsRepositorySql),
        RepositoryProvider(
            Entity.USER_PROBLEM_PROGRESS,
            UserProblemProgressRepositorySql,
        ),
    ],
    exports: [ProblemsService, ProblemsCountService],
})
export class ProblemsModule {}
