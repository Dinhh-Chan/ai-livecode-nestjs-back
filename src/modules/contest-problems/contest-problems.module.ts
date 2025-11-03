import { ContestProblemsController } from "./controller/contest-problems.controller";
import { ContestProblemsService } from "./services/contest-problems.services";
import { ContestProblemsModel } from "./models/contest-problems.models";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestProblemsRepositorySql } from "./repository/contest-problems-repository.sql";
import { ProblemsModule } from "@module/problems/problems.module";

@Module({
    imports: [
        SequelizeModule.forFeature([ContestProblemsModel]),
        forwardRef(() => ProblemsModule),
    ],
    controllers: [ContestProblemsController],
    providers: [
        ContestProblemsService,
        RepositoryProvider(
            Entity.CONTEST_PROBLEMS,
            ContestProblemsRepositorySql,
        ),
    ],
    exports: [ContestProblemsService],
})
export class ContestProblemsModule {}
