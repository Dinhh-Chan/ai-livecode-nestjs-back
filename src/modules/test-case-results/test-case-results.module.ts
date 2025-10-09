import { TestCaseResultsController } from "./controller/test-case-results.controller";
import { TestCaseResultsService } from "./services/test-case-results.services";
import { TestCaseResultsModel } from "./models/test-case-results.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { TestCaseResultsRepositorySql } from "./repository/test-case-results-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([TestCaseResultsModel])],
    controllers: [TestCaseResultsController],
    providers: [
        TestCaseResultsService,
        RepositoryProvider(
            Entity.TEST_CASE_RESULTS,
            TestCaseResultsRepositorySql,
        ),
    ],
    exports: [TestCaseResultsService],
})
export class TestCaseResultsModule {}
