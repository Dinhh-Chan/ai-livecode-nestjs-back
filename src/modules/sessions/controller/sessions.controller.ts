import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SessionsService } from "../services/sessions.service";
import { Session } from "../entities/sessions.entity";
import { CreateSessionDto } from "../dto/create-session.dto";
import { UpdateSessionDto } from "../dto/update-session.dto";
import { Controller, Get, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConditionSessionDto } from "../dto/condition-session.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import {
    ApiListResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";

@Controller("sessions")
@ApiTags("Sessions")
export class SessionsController extends BaseControllerFactory<Session>(
    Session,
    ConditionSessionDto,
    CreateSessionDto,
    UpdateSessionDto,
) {
    constructor(private readonly sessionsService: SessionsService) {
        super(sessionsService);
    }

    @Post()
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Tạo session mới",
        description: "API để tạo session chat mới",
    })
    @ApiRecordResponse(Session)
    async create(
        @ReqUser() user: User,
        @Body() createSessionDto: CreateSessionDto,
    ) {
        // Tự động gán user_id từ user hiện tại
        return this.sessionsService.create(user, {
            ...createSessionDto,
            user_id: user._id,
        } as any);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách sessions với thông tin user" })
    @ApiListResponse(Session)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionSessionDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Session>,
    ) {
        // Nếu không phải admin, chỉ hiển thị sessions của chính user đó
        if (user.systemRole !== SystemRole.ADMIN) {
            conditions = { ...conditions, user_id: user._id };
        }
        return this.sessionsService.getManyWithUsers(user, conditions, query);
    }

    @Get("my-sessions")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách sessions của chính user",
        description: "API để lấy danh sách sessions mà user hiện tại đã tạo",
    })
    @ApiListResponse(Session)
    async getMySessions(
        @ReqUser() user: User,
        @RequestQuery() query: GetManyQuery<Session>,
    ) {
        return this.sessionsService.getManyWithUsers(
            user,
            { user_id: user._id },
            query,
        );
    }
}
