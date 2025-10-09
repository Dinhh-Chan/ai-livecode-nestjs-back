import { JudgeNodesController } from "./controller/judge-nodes.controller";
import { JudgeNodesService } from "./services/judge-nodes.services";
import { JudgeNodesModel } from "./models/judge-nodes.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { JudgeNodesRepositorySql } from "./repository/judge-nodes-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([JudgeNodesModel])],
    controllers: [JudgeNodesController],
    providers: [
        JudgeNodesService,
        RepositoryProvider(Entity.JUDGE_NODES, JudgeNodesRepositorySql),
    ],
    exports: [JudgeNodesService],
})
export class JudgeNodesModule {}
