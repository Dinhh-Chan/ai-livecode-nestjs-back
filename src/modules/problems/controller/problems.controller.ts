import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ProblemsService } from "../services/problems.services";
import { Problems } from "../entities/problems.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { UpdateProblemsDto } from "../dto/update-problems.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionProblemsDto } from "../dto/condition-problems.dto";
import { GetManyQuery, GetOneQuery } from "@common/constant";
import { ReqUser } from "@common/decorator/auth.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import { User } from "@module/user/entities/user.entity";
import {
    ApiCondition,
    ApiGet,
    ApiListResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { BaseRouteSetup } from "@config/controller/base-controller.decorator";
import { PopulationDto } from "@common/dto/population.dto";

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

    // Override các method để sử dụng population
    // Đặt getMany trước getById để tránh route conflict
    @BaseRouteSetup("getMany", { authorize: false }, "get")
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet({ mode: "many" })
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getMany(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getOne", { authorize: false }, "get")
    @ApiRecordResponse(Problems)
    @ApiCondition()
    @ApiGet({ mode: "one" })
    async getOne(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetOneQuery<Problems>,
    ) {
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getOne(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getPage", { authorize: false }, "get")
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet()
    async getPage(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getPage(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getById", { authorize: false }, "get")
    @ApiRecordResponse(Problems)
    async getById(@ReqUser() user: User, @Param("id") id: string) {
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getById(user, id, { population });
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
    })
    @ApiQuery({
        name: "order",
        required: false,
        description: "Thứ tự sắp xếp (asc/desc)",
        enum: ["asc", "desc"],
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng records tối đa",
    })
    async getProblemsBySubTopic(
        @ReqUser() user: User,
        @Param("subTopicId") subTopicId: string,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getMany(
            user,
            { sub_topic_id: subTopicId },
            { ...query, population },
        );
    }
}
