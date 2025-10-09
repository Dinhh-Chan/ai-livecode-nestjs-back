import { InjectModel } from "@nestjs/sequelize";
import { JudgeNodeLogsModel } from "../models/judge-node-logs.models";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";
import { JudgeNodeLogsRepository } from "./judge-node-logs-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { LogEventType } from "../entities/judge-node-logs.entity";

export class JudgeNodeLogsRepositorySql
    extends SqlRepository<JudgeNodeLogs>
    implements JudgeNodeLogsRepository
{
    constructor(
        @InjectModel(JudgeNodeLogsModel)
        private readonly judgeNodeLogsModel: typeof JudgeNodeLogsModel,
    ) {
        super(judgeNodeLogsModel);
    }

    async findByNodeId(
        nodeId: string,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsModel.findAll({
            where: { judge_node_id: nodeId },
            order: [["createdAt", "DESC"]],
            limit,
        });
    }

    async findByEventType(
        eventType: LogEventType,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsModel.findAll({
            where: { event_type: eventType },
            order: [["createdAt", "DESC"]],
            limit,
        });
    }

    async findByNodeIdAndEventType(
        nodeId: string,
        eventType: LogEventType,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsModel.findAll({
            where: {
                judge_node_id: nodeId,
                event_type: eventType,
            },
            order: [["createdAt", "DESC"]],
            limit,
        });
    }

    async getRecentLogs(limit: number = 100): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsModel.findAll({
            order: [["createdAt", "DESC"]],
            limit,
        });
    }

    async getNodeActivitySummary(nodeId: string): Promise<{
        totalLogs: number;
        eventTypeCounts: Record<string, number>;
        lastActivity: Date | null;
    }> {
        const { Op } = await import("sequelize");

        // Đếm tổng số logs
        const totalLogs = await this.judgeNodeLogsModel.count({
            where: { judge_node_id: nodeId },
        });

        // Đếm theo từng event type
        const eventTypeCounts = await this.judgeNodeLogsModel.findAll({
            attributes: [
                "event_type",
                [this.judgeNodeLogsModel.sequelize.fn("COUNT", "*"), "count"],
            ],
            where: { judge_node_id: nodeId },
            group: ["event_type"],
            raw: true,
        });

        // Lấy hoạt động cuối cùng
        const lastLog = await this.judgeNodeLogsModel.findOne({
            where: { judge_node_id: nodeId },
            order: [["createdAt", "DESC"]],
        });

        // Chuyển đổi kết quả eventTypeCounts
        const eventTypeCountsRecord: Record<string, number> = {};
        eventTypeCounts.forEach((item: any) => {
            eventTypeCountsRecord[item.event_type] = parseInt(item.count);
        });

        return {
            totalLogs,
            eventTypeCounts: eventTypeCountsRecord,
            lastActivity: lastLog?.createdAt || null,
        };
    }
}
