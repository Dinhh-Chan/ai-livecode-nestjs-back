import { ProblemsController } from "./controller/problems.controller";
import { ProblemsService } from "./services/problems.services";
import { ProblemsModel } from "./models/problems.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProblemsRepositorySql } from "./repository/problems-repository.sql";

@Module({
  imports: [
    SequelizeModule.forFeature([ProblemsModel])
  ],
  controllers: [ProblemsController],
  providers: [
    ProblemsService,
    RepositoryProvider(Entity.PROBLEMS, ProblemsRepositorySql)
  ],
  exports: [ProblemsService]
})
export class ProblemsModule {}
