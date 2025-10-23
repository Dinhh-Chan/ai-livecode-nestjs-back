import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TopicsService } from "../services/topics.services";
import { Topics } from "../entities/topics.entity";
import { CreateTopicsDto } from "../dto/create-topics.dto";
import { UpdateTopicsDto } from "../dto/update-topics.dto";
import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConditionTopicsDto } from "../dto/condition-topics.dto";
import { SystemRole } from "@module/user/common/constant";
import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery } from "@common/constant";
import {
    RequestCondition,
    RequestQuery,
} from "@common/decorator/query.decorator";
import { ApiListResponse } from "@common/decorator/api.decorator";
import { AllowSystemRoles } from "@common/decorator/auth.decorator";

@Controller("topics")
@ApiTags("Topics")
export class TopicsController extends BaseControllerFactory<Topics>(
    Topics,
    ConditionTopicsDto,
    CreateTopicsDto,
    UpdateTopicsDto,
    {
        authorize: true,
        routes: {
            getMany: {
                enable: false, // Disable để tránh xung đột với route custom
            },
        },
    },
) {
    constructor(private readonly topicsService: TopicsService) {
        super(topicsService);
    }

    @Get("many")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({ summary: "Lấy danh sách topics" })
    @ApiListResponse(Topics)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionTopicsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Topics>,
    ) {
        return this.topicsService.getMany(user, conditions, query);
    }
}
