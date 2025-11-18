import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { MessagesService } from "../services/messages.service";
import { Message } from "../entities/messages.entity";
import { CreateMessageDto } from "../dto/create-message.dto";
import { UpdateMessageDto } from "../dto/update-message.dto";
import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { ConditionMessageDto } from "../dto/condition-message.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import {
    ApiListResponse,
    ApiRecordResponse,
    ApiGet,
} from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";

@Controller("messages")
@ApiTags("Messages")
export class MessagesController extends BaseControllerFactory<Message>(
    Message,
    ConditionMessageDto,
    CreateMessageDto,
    UpdateMessageDto,
) {
    constructor(private readonly messagesService: MessagesService) {
        super(messagesService);
    }

    @Post()
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Tạo message mới",
        description: "API để tạo message mới trong một session",
    })
    @ApiRecordResponse(Message)
    async create(
        @ReqUser() user: User,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        return this.messagesService.create(user, createMessageDto as any);
    }

    @Get("by-session/:sessionId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách messages theo session",
        description:
            "API để lấy danh sách messages của một session. Có thể sort theo createdAt, updatedAt, v.v. Ví dụ: sort[createdAt]=-1 (mới nhất trước) hoặc sort[createdAt]=1 (cũ nhất trước)",
    })
    @ApiParam({
        name: "sessionId",
        description: "ID của session",
        type: String,
    })
    @ApiGet({ mode: "many" })
    @ApiListResponse(Message)
    async getBySession(
        @ReqUser() user: User,
        @Param("sessionId") sessionId: string,
        @RequestQuery() query: GetManyQuery<Message>,
    ) {
        return this.messagesService.getBySessionId(user, sessionId, query);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách messages" })
    @ApiListResponse(Message)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionMessageDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Message>,
    ) {
        return this.messagesService.getManyWithUserFilter(
            user,
            conditions,
            query,
        );
    }
}
