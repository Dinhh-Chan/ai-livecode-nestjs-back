import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { JudgeNodes } from "../entities/judge-nodes.entity";

export interface JudgeNodesRepository extends BaseRepository<JudgeNodes> {
    // Có thể thêm các method custom cho JudgeNodes nếu cần
    findAvailableNodes(): Promise<JudgeNodes[]>;
    updateNodeStatus(
        nodeId: string,
        status: string,
        currentLoad?: number,
    ): Promise<JudgeNodes>;
    updateHeartbeat(nodeId: string): Promise<JudgeNodes>;
}
