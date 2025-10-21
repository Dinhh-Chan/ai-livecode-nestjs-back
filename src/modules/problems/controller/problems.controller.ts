import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ProblemsService } from "../services/problems.services";
import { Problems } from "../entities/problems.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { UpdateProblemsDto } from "../dto/update-problems.dto";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionProblemsDto } from "../dto/condition-problems.dto";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { SystemRole } from "@module/user/common/constant";
import { GetManyQuery, GetOneQuery } from "@common/constant";
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
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
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
