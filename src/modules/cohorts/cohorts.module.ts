import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { CohortsController } from "./controller/cohorts.controller";
import { CohortsService } from "./services/cohorts.service";
import { CohortModel } from "./models/cohorts.models";
import { CohortsSqlRepository } from "./repository/cohorts.repository";

@Module({
    imports: [SequelizeModule.forFeature([CohortModel])],
    controllers: [CohortsController],
    providers: [
        CohortsService,
        RepositoryProvider(Entity.COHORTS, CohortsSqlRepository),
    ],
    exports: [CohortsService],
})
export class CohortsModule {}
