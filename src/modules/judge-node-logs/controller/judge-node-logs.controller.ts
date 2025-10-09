import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { JudgeNodeLogsService } from "../services/judge-node-logs.services";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";
import { CreateJudgeNodeLogsDto } from "../dto/create-judge-node-logs.dto";
import { UpdateJudgeNodeLogsDto } from "../dto/update-judge-node-logs.dto";
import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiQuery,
} from "@nestjs/swagger";
import { ConditionJudgeNodeLogsDto } from "../dto/condition-judge-node-logs.dto";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { LogEventType } from "../entities/judge-node-logs.entity";

@Controller("judge-node-logs")
@ApiTags("Judge Node Logs")
export class JudgeNodeLogsController extends BaseControllerFactory<JudgeNodeLogs>(
    JudgeNodeLogs,
    ConditionJudgeNodeLogsDto,
    CreateJudgeNodeLogsDto,
    UpdateJudgeNodeLogsDto,
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
    constructor(private readonly judgeNodeLogsService: JudgeNodeLogsService) {
        super(judgeNodeLogsService);
    }

    @Get("by-node/:nodeId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy logs theo node ID",
        description: "API để lấy tất cả logs của một Judge0 node cụ thể",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng logs tối đa",
        example: 100,
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách logs của node",
        type: [JudgeNodeLogs],
    })
    async getLogsByNode(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
        @Query("limit") limit: number = 100,
    ) {
        return this.judgeNodeLogsService.getLogsByNodeId(nodeId, limit);
    }

    @Get("by-event-type/:eventType")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy logs theo loại sự kiện",
        description: "API để lấy tất cả logs của một loại sự kiện cụ thể",
    })
    @ApiParam({
        name: "eventType",
        description: "Loại sự kiện",
        enum: LogEventType,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng logs tối đa",
        example: 100,
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách logs theo loại sự kiện",
        type: [JudgeNodeLogs],
    })
    async getLogsByEventType(
        @ReqUser() user: User,
        @Param("eventType") eventType: LogEventType,
        @Query("limit") limit: number = 100,
    ) {
        return this.judgeNodeLogsService.getLogsByEventType(eventType, limit);
    }

    @Get("recent")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy logs gần đây nhất",
        description: "API để lấy các logs mới nhất trong hệ thống",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng logs tối đa",
        example: 100,
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách logs gần đây",
        type: [JudgeNodeLogs],
    })
    async getRecentLogs(
        @ReqUser() user: User,
        @Query("limit") limit: number = 100,
    ) {
        return this.judgeNodeLogsService.getRecentLogs(limit);
    }

    @Get("node-activity/:nodeId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Tóm tắt hoạt động của node",
        description: "API để lấy thống kê hoạt động của một Judge0 node",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiResponse({
        status: 200,
        description: "Tóm tắt hoạt động của node",
        schema: {
            type: "object",
            properties: {
                totalLogs: { type: "number" },
                eventTypeCounts: { type: "object" },
                lastActivity: { type: "string", format: "date-time" },
            },
        },
    })
    async getNodeActivitySummary(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
    ) {
        return this.judgeNodeLogsService.getNodeActivitySummary(nodeId);
    }

    @Get("daily-stats")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Thống kê logs theo ngày",
        description: "API để lấy thống kê logs theo từng ngày",
    })
    @ApiQuery({
        name: "days",
        required: false,
        description: "Số ngày để lấy thống kê (mặc định 7 ngày)",
        example: 7,
    })
    @ApiResponse({
        status: 200,
        description: "Thống kê logs theo ngày",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    date: { type: "string" },
                    totalLogs: { type: "number" },
                    eventTypeCounts: { type: "object" },
                },
            },
        },
    })
    async getDailyLogStats(
        @ReqUser() user: User,
        @Query("days") days: number = 7,
    ) {
        return this.judgeNodeLogsService.getDailyLogStats(days);
    }

    @Post("create-log")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Tạo log mới",
        description: "API để tạo log mới cho Judge0 node",
    })
    @ApiResponse({
        status: 201,
        description: "Log đã được tạo thành công",
        type: JudgeNodeLogs,
    })
    async createLog(
        @ReqUser() user: User,
        @Body()
        body: {
            nodeId: string;
            eventType: LogEventType;
            message?: string;
        },
    ) {
        return this.judgeNodeLogsService.createLog(
            user,
            body.nodeId,
            body.eventType,
            body.message,
        );
    }

    @Post("log-heartbeat")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Log heartbeat của node",
        description: "API để ghi log khi node gửi heartbeat",
    })
    @ApiResponse({
        status: 201,
        description: "Heartbeat log đã được tạo",
        type: JudgeNodeLogs,
    })
    async logHeartbeat(
        @ReqUser() user: User,
        @Body() body: { nodeId: string },
    ) {
        return this.judgeNodeLogsService.logHeartbeat(user, body.nodeId);
    }

    @Post("log-error")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Log lỗi của node",
        description: "API để ghi log khi node gặp lỗi",
    })
    @ApiResponse({
        status: 201,
        description: "Error log đã được tạo",
        type: JudgeNodeLogs,
    })
    async logError(
        @ReqUser() user: User,
        @Body()
        body: {
            nodeId: string;
            errorMessage: string;
        },
    ) {
        return this.judgeNodeLogsService.logError(
            user,
            body.nodeId,
            body.errorMessage,
        );
    }

    @Get("by-node-and-event/:nodeId/:eventType")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy logs theo node và event type",
        description: "API để lấy logs của một node với loại sự kiện cụ thể",
    })
    @ApiParam({
        name: "nodeId",
        description: "ID của Judge0 node",
        type: String,
    })
    @ApiParam({
        name: "eventType",
        description: "Loại sự kiện",
        enum: LogEventType,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng logs tối đa",
        example: 100,
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách logs theo node và event type",
        type: [JudgeNodeLogs],
    })
    async getLogsByNodeAndEventType(
        @ReqUser() user: User,
        @Param("nodeId") nodeId: string,
        @Param("eventType") eventType: LogEventType,
        @Query("limit") limit: number = 100,
    ) {
        return this.judgeNodeLogsService.getLogsByNodeIdAndEventType(
            nodeId,
            eventType,
            limit,
        );
    }
}
