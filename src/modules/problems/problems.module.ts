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

@Module({
    imports: [
        SequelizeModule.forFeature([ProblemsModel]),
        TestCasesModule,
        forwardRef(() => UserProblemProgressModule),
    ],
    controllers: [ProblemsController],
    providers: [
        ProblemsService,
        ProblemsCountService,
        RepositoryProvider(Entity.PROBLEMS, ProblemsRepositorySql),
    ],
    exports: [ProblemsService, ProblemsCountService],
})
export class ProblemsModule {}
