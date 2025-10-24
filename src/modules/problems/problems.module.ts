import { ProblemsController } from "./controller/problems.controller";
import { ProblemsService } from "./services/problems.services";
import { ProblemsModel } from "./models/problems.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProblemsRepositorySql } from "./repository/problems-repository.sql";
import { TestCasesModule } from "../test-cases/test-cases.module";

@Module({
    imports: [SequelizeModule.forFeature([ProblemsModel]), TestCasesModule],
    controllers: [ProblemsController],
    providers: [
        ProblemsService,
        RepositoryProvider(Entity.PROBLEMS, ProblemsRepositorySql),
    ],
    exports: [ProblemsService],
})
export class ProblemsModule {}
