import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SubTopicsService } from "../services/sub-topics.services";
import { SubTopics } from "../entities/sub-topics.entity";
import { CreateSubTopicsDto } from "../dto/create-sub-topics.dto";
import { UpdateSubTopicsDto } from "../dto/update-sub-topics.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionSubTopicsDto } from "../dto/condition-sub-topics.dto";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";

@Controller("sub-topics")
@ApiTags("Sub Topics")
export class SubTopicsController extends BaseControllerFactory<SubTopics>(
    SubTopics,
    ConditionSubTopicsDto,
    CreateSubTopicsDto,
    UpdateSubTopicsDto,
    {
        authorize: true,
        routes: {
            getById: {
                roles: [
                    SystemRole.USER,
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
            getMany: {
                roles: [
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
            getPage: {
                roles: [
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
        },
    },
) {
    constructor(private readonly subTopicsService: SubTopicsService) {
        super(subTopicsService);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.ADMIN, SystemRole.STUDENT, SystemRole.TEACHER)
    @ApiOperation({
        summary: "Lấy danh sách sub-topics (chỉ sub-topics có problems)",
    })
    @ApiListResponse(SubTopics)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionSubTopicsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<SubTopics>,
    ) {
        return this.subTopicsService.getManyHasProblems(
            user,
            conditions,
            query,
        );
    }

    @Get("by-topic/:topicId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary:
            "Lấy danh sách sub-topics theo topic ID (chỉ những sub-topic có problems)",
        description:
            "API trả về các sub-topics của topic, loại bỏ sub-topics không có problems",
    })
    @ApiParam({
        name: "topicId",
        description: "ID của topic",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiQuery({
        name: "select",
        required: false,
        description: "Các trường cần lấy",
        type: String,
        example: "_id,sub_topic_name,description,order_index",
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Sắp xếp theo trường",
        type: String,
        example: "order_index",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng bản ghi tối đa",
        type: Number,
        example: 10,
    })
    @ApiQuery({
        name: "skip",
        required: false,
        description: "Số lượng bản ghi bỏ qua",
        type: Number,
        example: 0,
    })
    @ApiListResponse(SubTopics)
    async getByTopicId(
        @ReqUser() user: User,
        @Param("topicId") topicId: string,
        @RequestQuery() query: GetManyQuery<SubTopics>,
    ) {
        return this.subTopicsService.getByTopicIdHasProblems(
            user,
            topicId,
            query,
        );
    }

    @Get("page")
    @AllowSystemRoles(SystemRole.ADMIN, SystemRole.STUDENT, SystemRole.TEACHER)
    @ApiOperation({ summary: "Lấy danh sách sub-topics có phân trang" })
    @ApiListResponse(SubTopics)
    async getPage(
        @ReqUser() user: User,
        @RequestCondition(ConditionSubTopicsDto) conditions: any,
        @RequestQuery() query: GetPageQuery<SubTopics>,
    ) {
        return this.subTopicsService.getPageWithProblemCounts(
            user,
            conditions,
            query,
        );
    }
}
