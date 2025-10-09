import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ProblemsService } from "../services/problems.services";
import { Problems } from "../entities/problems.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { UpdateProblemsDto } from "../dto/update-problems.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionProblemsDto } from "../dto/condition-problems.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser } from "@common/decorator/auth.decorator";
import { RequestQuery } from "@common/decorator/query.decorator";
import { User } from "@module/user/entities/user.entity";

@Controller("problems")
@ApiTags("Problems")
export class ProblemsController extends BaseControllerFactory<Problems>(
    Problems,
    ConditionProblemsDto,
    CreateProblemsDto,
    UpdateProblemsDto,
) {
    constructor(private readonly problemsService: ProblemsService) {
        super(problemsService);
    }

    @Get("by-sub-topic/:subTopicId")
    @ApiOperation({
        summary: "Lấy danh sách problems theo sub_topic_id",
        description: "API để lấy tất cả problems thuộc về một sub topic cụ thể",
    })
    @ApiParam({
        name: "subTopicId",
        description: "ID của sub topic",
        type: String,
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Trường để sắp xếp",
        enum: [
            "name",
            "difficulty",
            "created_at",
            "updated_at",
            "time_limit_ms",
            "memory_limit_mb",
        ],
        example: "difficulty",
    })
    @ApiQuery({
        name: "order",
        required: false,
        description: "Thứ tự sắp xếp (asc/desc). Mặc định là asc",
        enum: ["asc", "desc"],
        example: "asc",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng records tối đa",
        example: 10,
    })
    @ApiQuery({
        name: "difficulty",
        required: false,
        description: "Lọc theo độ khó (1-5)",
        example: 2,
    })
    @ApiQuery({
        name: "is_public",
        required: false,
        description: "Lọc theo trạng thái công khai (true/false)",
        example: true,
    })
    async getProblemsBySubTopic(
        @ReqUser() user: User,
        @Param("subTopicId") subTopicId: string,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        return this.problemsService.getMany(
            user,
            { sub_topic_id: subTopicId },
            query,
        );
    }
}
