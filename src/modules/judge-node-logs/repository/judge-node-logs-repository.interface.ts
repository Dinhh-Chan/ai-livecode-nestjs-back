import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";
import { LogEventType } from "../entities/judge-node-logs.entity";

export interface JudgeNodeLogsRepository extends BaseRepository<JudgeNodeLogs> {
    // Các method custom cho JudgeNodeLogs
    findByNodeId(nodeId: string, limit?: number): Promise<JudgeNodeLogs[]>;
    findByEventType(
        eventType: LogEventType,
        limit?: number,
    ): Promise<JudgeNodeLogs[]>;
    findByNodeIdAndEventType(
        nodeId: string,
        eventType: LogEventType,
        limit?: number,
    ): Promise<JudgeNodeLogs[]>;
    getRecentLogs(limit?: number): Promise<JudgeNodeLogs[]>;
    getNodeActivitySummary(nodeId: string): Promise<{
        totalLogs: number;
        eventTypeCounts: Record<string, number>;
        lastActivity: Date | null;
    }>;
}
