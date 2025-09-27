import { TopicsController } from "./controller/topics.controller";
import { TopicsService } from "./services/topics.services";
import { TopicsModel } from "./models/topics.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { TopicsRepositorySql } from "./repository/topics-repository.sql";

@Module({
  imports: [
    SequelizeModule.forFeature([TopicsModel])
  ],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    RepositoryProvider(Entity.TOPICS, TopicsRepositorySql)
  ],
  exports: [TopicsService]
})
export class TopicsModule {}
