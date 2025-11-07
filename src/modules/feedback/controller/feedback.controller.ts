import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../entities/feedback.entity";
import { CreateFeedbackDto } from "../dto/create-feedback.dto";
import { UpdateFeedbackDto } from "../dto/update-feedback.dto";
import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    UploadedFile,
    Put,
    BadRequestException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiConsumes,
    ApiBody,
} from "@nestjs/swagger";
import { ConditionFeedbackDto } from "../dto/condition-feedback.dto";
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
import { UploadFile } from "@common/decorator/file.decorator";

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
    @ApiRecordResponse(Feedback)
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

    @Post("with-image")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiConsumes("multipart/form-data")
    @UploadFile()
    @ApiOperation({
        summary: "Tạo feedback mới với hình ảnh",
        description:
            "API để người dùng tạo feedback hoặc báo lỗi kèm hình ảnh đính kèm",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    enum: ["feedback", "error"],
                    description: "Loại feedback",
                },
                title: {
                    type: "string",
                    description: "Tiêu đề feedback",
                },
                description: {
                    type: "string",
                    description: "Mô tả chi tiết",
                },
                file: {
                    type: "string",
                    format: "binary",
                    description: "Hình ảnh đính kèm (optional)",
                },
            },
            required: ["type", "title", "description"],
        },
    })
    @ApiRecordResponse(Feedback)
    async createWithImage(
        @ReqUser() user: User,
        @Body() createFeedbackDto: CreateFeedbackDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let imageUrl: string | undefined;
        if (file) {
            imageUrl = await this.feedbackService.saveImage(file);
        }
        // Tự động gán user_id từ user hiện tại
        return this.feedbackService.create(user, {
            ...createFeedbackDto,
            user_id: user._id,
            image_url: imageUrl,
        } as any);
    }

    @Put(":id/image")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiConsumes("multipart/form-data")
    @UploadFile()
    @ApiOperation({
        summary: "Cập nhật hình ảnh cho feedback",
        description: "API để cập nhật hình ảnh đính kèm cho feedback",
    })
    @ApiParam({
        name: "id",
        description: "ID của feedback",
        type: String,
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                    description: "Hình ảnh đính kèm",
                },
            },
            required: ["file"],
        },
    })
    @ApiRecordResponse(Feedback)
    async updateImage(
        @ReqUser() user: User,
        @Param("id") id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException("File is required");
        }

        const feedback = await this.feedbackService.getById(user, id);

        // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu feedback mới được cập nhật
        if (
            user.systemRole !== SystemRole.ADMIN &&
            feedback.user_id !== user._id
        ) {
            throw new BadRequestException(
                "You don't have permission to update this feedback",
            );
        }

        // Xóa ảnh cũ nếu có
        if (feedback.image_url) {
            await this.feedbackService.deleteImage(feedback.image_url);
        }

        // Lưu ảnh mới
        const imageUrl = await this.feedbackService.saveImage(file);

        // Cập nhật feedback
        return this.feedbackService.updateById(user, id, {
            image_url: imageUrl,
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
