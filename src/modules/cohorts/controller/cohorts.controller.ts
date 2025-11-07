import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { CohortsService } from "../services/cohorts.service";
import { Cohort } from "../entities/cohorts.entity";
import { CreateCohortDto } from "../dto/create-cohort.dto";
import { UpdateCohortDto } from "../dto/update-cohort.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionCohortDto } from "../dto/condition-cohort.dto";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";

@Controller("cohorts")
@ApiTags("Cohorts")
export class CohortsController extends BaseControllerFactory<Cohort>(
    Cohort,
    ConditionCohortDto,
    CreateCohortDto,
    UpdateCohortDto,
) {
    constructor(private readonly cohortsService: CohortsService) {
        super(cohortsService);
    }

    @Get("active")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách khóa học đang hoạt động",
        description: "API để lấy danh sách khóa học đang hoạt động",
    })
    @ApiListResponse(Cohort)
    async getActiveCohorts(@ReqUser() user: User) {
        return this.cohortsService.getMany(user, { is_active: true }, {});
    }

    @Get("current")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách khóa học đang diễn ra",
        description: "API để lấy danh sách khóa học đang diễn ra",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng khóa học trả về",
        type: Number,
        example: 5,
    })
    @ApiListResponse(Cohort)
    async getCurrentCohorts(
        @ReqUser() user: User,
        @Query("limit") limit?: number,
    ) {
        const now = new Date();
        return this.cohortsService.getMany(
            user,
            {
                start_time: { $lte: now },
                end_time: { $gte: now },
                is_active: true,
            } as any,
            { limit: limit || 5 } as any,
        );
    }

    @Get("upcoming")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách khóa học sắp diễn ra",
        description: "API để lấy danh sách khóa học sắp diễn ra",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng khóa học trả về",
        type: Number,
        example: 5,
    })
    @ApiListResponse(Cohort)
    async getUpcomingCohorts(
        @ReqUser() user: User,
        @Query("limit") limit?: number,
    ) {
        const now = new Date();
        return this.cohortsService.getMany(
            user,
            {
                start_time: { $gt: now },
                is_active: true,
            } as any,
            { limit: limit || 5, sort: { start_time: 1 } } as any,
        );
    }

    @Get("code/:code")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy thông tin khóa học theo mã",
        description: "API để lấy thông tin khóa học theo mã",
    })
    @ApiParam({
        name: "code",
        description: "Mã khóa học",
        type: String,
        example: "K15",
    })
    async findByCode(@ReqUser() user: User, @Param("code") code: string) {
        return this.cohortsService.getOne(user, { code }, {});
    }
}
