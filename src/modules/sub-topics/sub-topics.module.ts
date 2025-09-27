import { SubTopicsController } from "./controller/sub-topics.controller";
import { SubTopicsService } from "./services/sub-topics.services";
import { SubTopicsModel } from "./models/sub-topics.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { SubTopicsRepositorySql } from "./repository/sub-topics-repository.sql";

@Module({
  imports: [
    SequelizeModule.forFeature([SubTopicsModel])
  ],
  controllers: [SubTopicsController],
  providers: [
    SubTopicsService,
    RepositoryProvider(Entity.SUB_TOPICS, SubTopicsRepositorySql)
  ],
  exports: [SubTopicsService]
})
export class SubTopicsModule {}
