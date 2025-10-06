import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SubTopicsService } from "../services/sub-topics.services";
import { SubTopics } from "../entities/sub-topics.entity";
import { CreateSubTopicsDto } from "../dto/create-sub-topics.dto";
import { UpdateSubTopicsDto } from "../dto/update-sub-topics.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionSubTopicsDto } from "../dto/condition-sub-topics.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { ApiListResponse } from "@common/decorator/api.decorator";
import { RequestQuery } from "@common/decorator/query.decorator";

@Controller("sub-topics")
@ApiTags("Sub Topics")
export class SubTopicsController extends BaseControllerFactory<SubTopics>(
    SubTopics,
    ConditionSubTopicsDto,
    CreateSubTopicsDto,
    UpdateSubTopicsDto,
) {
    constructor(private readonly subTopicsService: SubTopicsService) {
        super(subTopicsService);
    }

    @Get("by-topic/:topicId")
    @ApiOperation({
        summary: "Lấy danh sách sub-topics theo topic ID",
        description:
            "API để lấy danh sách tất cả sub-topics thuộc về một topic cụ thể",
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
        return this.subTopicsService.getByTopicId(user, topicId, query);
    }
}
