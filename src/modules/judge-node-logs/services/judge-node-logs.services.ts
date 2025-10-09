import { BaseService } from "@config/service/base.service";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";
import { JudgeNodeLogsRepository } from "../repository/judge-node-logs-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { LogEventType } from "../entities/judge-node-logs.entity";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class JudgeNodeLogsService extends BaseService<
    JudgeNodeLogs,
    JudgeNodeLogsRepository
> {
    constructor(
        @InjectRepository(Entity.JUDGE_NODE_LOGS)
        private readonly judgeNodeLogsRepository: JudgeNodeLogsRepository,
    ) {
        super(judgeNodeLogsRepository);
    }

    /**
     * Lấy logs theo node ID
     */
    async getLogsByNodeId(
        nodeId: string,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsRepository.findByNodeId(nodeId, limit);
    }

    /**
     * Lấy logs theo event type
     */
    async getLogsByEventType(
        eventType: LogEventType,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsRepository.findByEventType(eventType, limit);
    }

    /**
     * Lấy logs theo node ID và event type
     */
    async getLogsByNodeIdAndEventType(
        nodeId: string,
        eventType: LogEventType,
        limit: number = 100,
    ): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsRepository.findByNodeIdAndEventType(
            nodeId,
            eventType,
            limit,
        );
    }

    /**
     * Lấy logs gần đây nhất
     */
    async getRecentLogs(limit: number = 100): Promise<JudgeNodeLogs[]> {
        return this.judgeNodeLogsRepository.getRecentLogs(limit);
    }

    /**
     * Lấy tóm tắt hoạt động của node
     */
    async getNodeActivitySummary(nodeId: string): Promise<{
        totalLogs: number;
        eventTypeCounts: Record<string, number>;
        lastActivity: Date | null;
    }> {
        return this.judgeNodeLogsRepository.getNodeActivitySummary(nodeId);
    }

    /**
     * Tạo log mới cho node
     */
    async createLog(
        user: User,
        nodeId: string,
        eventType: LogEventType,
        message?: string,
    ): Promise<JudgeNodeLogs> {
        return this.judgeNodeLogsRepository.create({
            judge_node_id: nodeId,
            event_type: eventType,
            message,
        });
    }

    /**
     * Log heartbeat của node
     */
    async logHeartbeat(user: User, nodeId: string): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.HEARTBEAT,
            "Node heartbeat received",
        );
    }

    /**
     * Log khi gán bài cho node
     */
    async logSubmissionAssigned(
        user: User,
        nodeId: string,
        submissionId: string,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.SUBMISSION_ASSIGNED,
            `Submission ${submissionId} assigned to node`,
        );
    }

    /**
     * Log khi hoàn thành chấm bài
     */
    async logSubmissionCompleted(
        user: User,
        nodeId: string,
        submissionId: string,
        result: string,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.SUBMISSION_COMPLETED,
            `Submission ${submissionId} completed with result: ${result}`,
        );
    }

    /**
     * Log lỗi của node
     */
    async logError(
        user: User,
        nodeId: string,
        errorMessage: string,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.ERROR,
            `Error: ${errorMessage}`,
        );
    }

    /**
     * Log khi node online
     */
    async logNodeOnline(user: User, nodeId: string): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.NODE_ONLINE,
            "Node came online",
        );
    }

    /**
     * Log khi node offline
     */
    async logNodeOffline(
        user: User,
        nodeId: string,
        reason?: string,
    ): Promise<JudgeNodeLogs> {
        const message = reason
            ? `Node went offline: ${reason}`
            : "Node went offline";
        return this.createLog(user, nodeId, LogEventType.NODE_OFFLINE, message);
    }

    /**
     * Log khi thay đổi trạng thái node
     */
    async logStatusChanged(
        user: User,
        nodeId: string,
        oldStatus: string,
        newStatus: string,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.STATUS_CHANGED,
            `Status changed from ${oldStatus} to ${newStatus}`,
        );
    }

    /**
     * Log khi thay đổi tải node
     */
    async logLoadChanged(
        user: User,
        nodeId: string,
        oldLoad: number,
        newLoad: number,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.LOAD_CHANGED,
            `Load changed from ${oldLoad} to ${newLoad}`,
        );
    }

    /**
     * Log khi bắt đầu bảo trì
     */
    async logMaintenanceStart(
        user: User,
        nodeId: string,
        reason?: string,
    ): Promise<JudgeNodeLogs> {
        const message = reason
            ? `Maintenance started: ${reason}`
            : "Maintenance started";
        return this.createLog(
            user,
            nodeId,
            LogEventType.MAINTENANCE_START,
            message,
        );
    }

    /**
     * Log khi kết thúc bảo trì
     */
    async logMaintenanceEnd(
        user: User,
        nodeId: string,
    ): Promise<JudgeNodeLogs> {
        return this.createLog(
            user,
            nodeId,
            LogEventType.MAINTENANCE_END,
            "Maintenance completed",
        );
    }

    /**
     * Lấy logs của tất cả nodes trong khoảng thời gian
     */
    async getLogsByTimeRange(
        startDate: Date,
        endDate: Date,
        nodeId?: string,
        eventType?: LogEventType,
    ): Promise<JudgeNodeLogs[]> {
        const conditions: any = {
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        if (nodeId) {
            conditions.judge_node_id = nodeId;
        }

        if (eventType) {
            conditions.event_type = eventType;
        }

        return this.judgeNodeLogsRepository.getMany(conditions, {});
    }

    /**
     * Lấy thống kê logs theo ngày
     */
    async getDailyLogStats(days: number = 7): Promise<
        {
            date: string;
            totalLogs: number;
            eventTypeCounts: Record<string, number>;
        }[]
    > {
        const { Op } = await import("sequelize");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const logs = await this.judgeNodeLogsRepository.getMany(
            {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            {},
        );

        // Nhóm logs theo ngày
        const dailyStats: Record<string, any> = {};

        logs.forEach((log) => {
            const date = new Date((log as any).createdAt)
                .toISOString()
                .split("T")[0];

            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date,
                    totalLogs: 0,
                    eventTypeCounts: {},
                };
            }

            dailyStats[date].totalLogs++;

            if (!dailyStats[date].eventTypeCounts[log.event_type]) {
                dailyStats[date].eventTypeCounts[log.event_type] = 0;
            }
            dailyStats[date].eventTypeCounts[log.event_type]++;
        });

        return Object.values(dailyStats).sort((a, b) =>
            a.date.localeCompare(b.date),
        );
    }
}
