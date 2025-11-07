import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../entities/feedback.entity";
import { CreateFeedbackDto } from "../dto/create-feedback.dto";
import { UpdateFeedbackDto } from "../dto/update-feedback.dto";
import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionFeedbackDto } from "../dto/condition-feedback.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";

@Controller("feedback")
@ApiTags("Feedback")
export class FeedbackController extends BaseControllerFactory<Feedback>(
    Feedback,
    ConditionFeedbackDto,
    CreateFeedbackDto,
    UpdateFeedbackDto,
) {
    constructor(private readonly feedbackService: FeedbackService) {
        super(feedbackService);
    }

    @Post()
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Tạo feedback mới",
        description: "API để người dùng tạo feedback hoặc báo lỗi",
    })
    async create(
        @ReqUser() user: User,
        @Body() createFeedbackDto: CreateFeedbackDto,
    ) {
        // Tự động gán user_id từ user hiện tại
        return this.feedbackService.create(user, {
            ...createFeedbackDto,
            user_id: user._id,
        } as any);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách feedback với thông tin user" })
    @ApiListResponse(Feedback)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionFeedbackDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Feedback>,
    ) {
        // Nếu không phải admin, chỉ hiển thị feedback của chính user đó
        if (user.systemRole !== SystemRole.ADMIN) {
            conditions = { ...conditions, user_id: user._id };
        }
        return this.feedbackService.getManyWithUsers(user, conditions, query);
    }

    @Get("my-feedback")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách feedback của chính user",
        description: "API để lấy danh sách feedback mà user hiện tại đã tạo",
    })
    @ApiListResponse(Feedback)
    async getMyFeedback(
        @ReqUser() user: User,
        @RequestQuery() query: GetManyQuery<Feedback>,
    ) {
        return this.feedbackService.getManyWithUsers(
            user,
            { user_id: user._id },
            query,
        );
    }

    @Get("by-type/:type")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy danh sách feedback theo loại",
        description:
            "API để lấy danh sách feedback theo loại (feedback hoặc error)",
    })
    @ApiParam({
        name: "type",
        description: "Loại feedback (feedback hoặc error)",
        type: String,
        example: "error",
    })
    @ApiListResponse(Feedback)
    async getByType(
        @ReqUser() user: User,
        @Param("type") type: string,
        @RequestQuery() query: GetManyQuery<Feedback>,
    ) {
        const conditions: any = { type };
        // Nếu không phải admin, chỉ hiển thị feedback của chính user đó
        if (user.systemRole !== SystemRole.ADMIN) {
            conditions.user_id = user._id;
        }
        return this.feedbackService.getManyWithUsers(user, conditions, query);
    }

    @Get("by-status/:status")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy danh sách feedback theo trạng thái",
        description:
            "API để lấy danh sách feedback theo trạng thái (pending, doing, fixed, rejected)",
    })
    @ApiParam({
        name: "status",
        description: "Trạng thái feedback",
        type: String,
        example: "pending",
    })
    @ApiListResponse(Feedback)
    async getByStatus(
        @ReqUser() user: User,
        @Param("status") status: string,
        @RequestQuery() query: GetManyQuery<Feedback>,
    ) {
        const conditions: any = { status };
        // Nếu không phải admin, chỉ hiển thị feedback của chính user đó
        if (user.systemRole !== SystemRole.ADMIN) {
            conditions.user_id = user._id;
        }
        return this.feedbackService.getManyWithUsers(user, conditions, query);
    }
}
