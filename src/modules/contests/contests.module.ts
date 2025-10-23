import { ContestsController } from "./controller/contests.controller";
import { ContestsService } from "./services/contests.services";
import { ContestsModel } from "./models/contests.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestsRepositorySql } from "./repository/contests-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([ContestsModel])],
    controllers: [ContestsController],
    providers: [
        ContestsService,
        RepositoryProvider(Entity.CONTESTS, ContestsRepositorySql),
    ],
    exports: [ContestsService],
})
export class ContestsModule {}
