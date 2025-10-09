import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { JudgeNodesService } from "../services/judge-nodes.services";
import { JudgeNodes } from "../entities/judge-nodes.entity";
import { CreateJudgeNodesDto } from "../dto/create-judge-nodes.dto";
import { UpdateJudgeNodesDto } from "../dto/update-judge-nodes.dto";
import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ConditionJudgeNodesDto } from "../dto/condition-judge-nodes.dto";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { JudgeNodeStatus } from "../entities/judge-nodes.entity";

@Controller("judge-nodes")
@ApiTags("Judge Nodes")
export class JudgeNodesController extends BaseControllerFactory<JudgeNodes>(
    JudgeNodes,
    ConditionJudgeNodesDto,
    CreateJudgeNodesDto,
    UpdateJudgeNodesDto,
    {
        authorize: true,
        routes: {
            getById: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getMany: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getPage: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            create: {
                roles: [SystemRole.ADMIN],
            },
            updateById: {
                roles: [SystemRole.ADMIN],
            },
            deleteById: {
                roles: [SystemRole.ADMIN],
            },
        },
    },
) {
    constructor(private readonly judgeNodesService: JudgeNodesService) {
        super(judgeNodesService);
    }

    @Get("available")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy danh sách các node có sẵn để chấm bài",
        description:
            "API để lấy danh sách các Judge0 nodes đang online và có thể nhận bài chấm",
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách các node có sẵn",
        type: [JudgeNodes],
    })
    async getAvailableNodes() {
        return this.judgeNodesService.getAvailableNodes();
    }

    @Get("best")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy node phù hợp nhất để chấm bài",
        description: "API để lấy node có tải thấp nhất và đang online",
    })
    @ApiResponse({
        status: 200,
        description: "Node phù hợp nhất hoặc null",
        type: JudgeNodes,
    })
    async getBestNode() {
        return this.judgeNodesService.selectBestNode();
    }

    @Post(":nodeId/heartbeat")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Cập nhật heartbeat của node",
        description: "API để Judge0 node báo cáo trạng thái hoạt động",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Node đã được cập nhật heartbeat",
        type: JudgeNodes,
    })
    async updateHeartbeat(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
    ) {
        return this.judgeNodesService.updateHeartbeat(nodeId);
    }

    @Put(":nodeId/status")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Cập nhật trạng thái node",
        description: "API để cập nhật trạng thái của Judge0 node",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Node đã được cập nhật trạng thái",
        type: JudgeNodes,
    })
    async updateNodeStatus(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
        @Body() body: { status: JudgeNodeStatus; current_load?: number },
    ) {
        return this.judgeNodesService.updateNodeStatus(
            nodeId,
            body.status,
            body.current_load,
        );
    }

    @Post(":nodeId/load/increment")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Tăng tải của node",
        description: "API để tăng số lượng bài đang chấm của node",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Node đã được tăng tải",
        type: JudgeNodes,
    })
    async incrementLoad(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
    ) {
        return this.judgeNodesService.incrementLoad(nodeId);
    }

    @Post(":nodeId/load/decrement")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Giảm tải của node",
        description: "API để giảm số lượng bài đang chấm của node",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Node đã được giảm tải",
        type: JudgeNodes,
    })
    async decrementLoad(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
    ) {
        return this.judgeNodesService.decrementLoad(nodeId);
    }

    @Get(":nodeId/online-status")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Kiểm tra node có online không",
        description:
            "API để kiểm tra node có đang hoạt động dựa trên heartbeat",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Trạng thái online của node",
        schema: {
            type: "object",
            properties: {
                isOnline: { type: "boolean" },
                lastHeartbeat: { type: "string", format: "date-time" },
            },
        },
    })
    async checkNodeOnlineStatus(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
    ) {
        const node = await this.judgeNodesService.getById(user, nodeId);
        const isOnline = await this.judgeNodesService.isNodeOnline(nodeId);

        return {
            isOnline,
            lastHeartbeat: node.last_heartbeat,
            status: node.status,
            currentLoad: node.current_load,
            maxCapacity: node.max_capacity,
        };
    }

    @Post("health-check")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Kiểm tra và cập nhật trạng thái offline nodes",
        description:
            "API để kiểm tra các node không có heartbeat và đặt chúng offline",
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách các node đã được đặt offline",
        type: [JudgeNodes],
    })
    async healthCheck() {
        return this.judgeNodesService.checkAndUpdateOfflineNodes();
    }
}
