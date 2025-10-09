import { BaseService } from "@config/service/base.service";
import { JudgeNodes } from "../entities/judge-nodes.entity";
import { JudgeNodesRepository } from "../repository/judge-nodes-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { JudgeNodeStatus } from "../entities/judge-nodes.entity";

@Injectable()
export class JudgeNodesService extends BaseService<
    JudgeNodes,
    JudgeNodesRepository
> {
    constructor(
        @InjectRepository(Entity.JUDGE_NODES)
        private readonly judgeNodesRepository: JudgeNodesRepository,
    ) {
        super(judgeNodesRepository);
    }

    /**
     * Lấy danh sách các node có sẵn để chấm bài
     */
    async getAvailableNodes(): Promise<JudgeNodes[]> {
        return this.judgeNodesRepository.findAvailableNodes();
    }

    /**
     * Cập nhật trạng thái node
     */
    async updateNodeStatus(
        nodeId: string,
        status: JudgeNodeStatus,
        currentLoad?: number,
    ): Promise<JudgeNodes> {
        return this.judgeNodesRepository.updateNodeStatus(
            nodeId,
            status,
            currentLoad,
        );
    }

    /**
     * Cập nhật heartbeat của node
     */
    async updateHeartbeat(nodeId: string): Promise<JudgeNodes> {
        return this.judgeNodesRepository.updateHeartbeat(nodeId);
    }

    /**
     * Tăng tải của node khi nhận bài chấm
     */
    async incrementLoad(nodeId: string): Promise<JudgeNodes> {
        const node = await this.judgeNodesRepository.getById(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        const newLoad = node.current_load + 1;
        if (newLoad > node.max_capacity) {
            throw new Error(`Node ${nodeId} is at maximum capacity`);
        }

        return this.judgeNodesRepository.updateNodeStatus(
            nodeId,
            node.status,
            newLoad,
        );
    }

    /**
     * Giảm tải của node khi hoàn thành chấm bài
     */
    async decrementLoad(nodeId: string): Promise<JudgeNodes> {
        const node = await this.judgeNodesRepository.getById(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }

        const newLoad = Math.max(0, node.current_load - 1);
        return this.judgeNodesRepository.updateNodeStatus(
            nodeId,
            node.status,
            newLoad,
        );
    }

    /**
     * Chọn node phù hợp nhất để chấm bài
     */
    async selectBestNode(): Promise<JudgeNodes | null> {
        const availableNodes = await this.getAvailableNodes();

        if (availableNodes.length === 0) {
            return null;
        }

        // Chọn node có tải thấp nhất
        return availableNodes.reduce((best, current) => {
            return current.current_load < best.current_load ? current : best;
        });
    }

    /**
     * Kiểm tra node có online không dựa trên heartbeat
     */
    async isNodeOnline(
        nodeId: string,
        timeoutMinutes: number = 5,
    ): Promise<boolean> {
        const node = await this.judgeNodesRepository.getById(nodeId);
        if (!node) {
            return false;
        }

        const now = new Date();
        const lastHeartbeat = new Date(node.last_heartbeat);
        const diffMinutes =
            (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);

        return (
            diffMinutes < timeoutMinutes &&
            node.status === JudgeNodeStatus.ONLINE
        );
    }

    /**
     * Đặt node offline nếu không có heartbeat
     */
    async checkAndUpdateOfflineNodes(
        timeoutMinutes: number = 5,
    ): Promise<JudgeNodes[]> {
        const allNodes = await this.judgeNodesRepository.getMany({}, {});
        const offlineNodes: JudgeNodes[] = [];

        for (const node of allNodes) {
            if (!(await this.isNodeOnline(node._id, timeoutMinutes))) {
                await this.updateNodeStatus(node._id, JudgeNodeStatus.OFFLINE);
                offlineNodes.push(node);
            }
        }

        return offlineNodes;
    }
}
