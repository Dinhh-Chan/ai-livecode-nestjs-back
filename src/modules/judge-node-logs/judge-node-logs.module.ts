import { JudgeNodeLogsController } from "./controller/judge-node-logs.controller";
import { JudgeNodeLogsService } from "./services/judge-node-logs.services";
import { JudgeNodeLogsModel } from "./models/judge-node-logs.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { JudgeNodeLogsRepositorySql } from "./repository/judge-node-logs-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([JudgeNodeLogsModel])],
    controllers: [JudgeNodeLogsController],
    providers: [
        JudgeNodeLogsService,
        RepositoryProvider(Entity.JUDGE_NODE_LOGS, JudgeNodeLogsRepositorySql),
    ],
    exports: [JudgeNodeLogsService],
})
export class JudgeNodeLogsModule {}
