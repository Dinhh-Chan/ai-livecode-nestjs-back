import { InjectModel } from "@nestjs/sequelize";
import { JudgeNodesModel } from "../models/judge-nodes.models";
import { JudgeNodes } from "../entities/judge-nodes.entity";
import { JudgeNodesRepository } from "./judge-nodes-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { JudgeNodeStatus } from "../entities/judge-nodes.entity";

export class JudgeNodesRepositorySql
    extends SqlRepository<JudgeNodes>
    implements JudgeNodesRepository
{
    constructor(
        @InjectModel(JudgeNodesModel)
        private readonly judgeNodesModel: typeof JudgeNodesModel,
    ) {
        super(judgeNodesModel);
    }

    async findAvailableNodes(): Promise<JudgeNodes[]> {
        const { Op } = await import("sequelize");
        return this.judgeNodesModel.findAll({
            where: {
                status: JudgeNodeStatus.ONLINE,
                current_load: {
                    [Op.lt]:
                        this.judgeNodesModel.rawAttributes.max_capacity
                            .defaultValue,
                },
            },
        });
    }

    async updateNodeStatus(
        nodeId: string,
        status: string,
        currentLoad?: number,
    ): Promise<JudgeNodes> {
        const updateData: any = { status };
        if (currentLoad !== undefined) {
            updateData.current_load = currentLoad;
        }

        const [affectedCount] = await this.judgeNodesModel.update(updateData, {
            where: { _id: nodeId },
        });

        if (affectedCount === 0) {
            throw new Error(`Node ${nodeId} not found`);
        }

        return this.judgeNodesModel.findByPk(nodeId);
    }

    async updateHeartbeat(nodeId: string): Promise<JudgeNodes> {
        const [affectedCount] = await this.judgeNodesModel.update(
            { last_heartbeat: new Date() },
            { where: { _id: nodeId } },
        );

        if (affectedCount === 0) {
            throw new Error(`Node ${nodeId} not found`);
        }

        return this.judgeNodesModel.findByPk(nodeId);
    }
}
