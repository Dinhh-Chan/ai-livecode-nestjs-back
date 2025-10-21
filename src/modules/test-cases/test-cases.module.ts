import { TestCasesController } from "./controller/test-cases.controller";
import { TestCasesService } from "./services/test-cases.services";
import { TestCasesModel } from "./models/test-cases.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { TestCasesRepositorySql } from "./repository/test-cases-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([TestCasesModel])],
    controllers: [TestCasesController],
    providers: [
        TestCasesService,
        RepositoryProvider(Entity.TEST_CASES, TestCasesRepositorySql),
    ],
    exports: [TestCasesService],
})
export class TestCasesModule {}
