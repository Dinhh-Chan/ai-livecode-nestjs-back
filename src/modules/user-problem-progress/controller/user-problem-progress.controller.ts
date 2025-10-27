import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Controller, Get, Post, Put, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { UserProblemProgressService } from "../services/user-problem-progress.service";
import {
    UserProblemProgressDto,
    UserProgressStatsDto,
    ProblemStatusDto,
    UpdateProgressDto,
    UserProgressSummaryDto,
    CreateUserProblemProgressDto,
    UpdateUserProblemProgressDto,
    ConditionUserProblemProgressDto,
} from "../dto";
import { UserProblemProgress } from "../entities/user-problem-progress.entity";
import { User } from "@module/user/entities/user.entity";
import {
    ApiRecordResponse,
    ApiListResponse,
} from "@common/decorator/api.decorator";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { SystemRole } from "@module/user/common/constant";
import { GetManyQuery, GetOneQuery } from "@common/constant";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import { BaseRouteSetup } from "@config/controller/base-controller.decorator";
import { PopulationDto } from "@common/dto/population.dto";
import { ApiCondition, ApiGet } from "@common/decorator/api.decorator";

@Controller("user-problem-progress")
@ApiTags("user-problem-progress")
export class UserProblemProgressController extends BaseControllerFactory<UserProblemProgress>(
    UserProblemProgress,
    ConditionUserProblemProgressDto,
    CreateUserProblemProgressDto,
    UpdateUserProblemProgressDto,
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
    constructor(
        private readonly userProblemProgressService: UserProblemProgressService,
    ) {
        super(userProblemProgressService);
    }

    // Override các method để sử dụng population
    @BaseRouteSetup("getMany", { authorize: false }, "get")
    @ApiListResponse(UserProblemProgressDto)
    @ApiCondition()
    @ApiGet({ mode: "many" })
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionUserProblemProgressDto) conditions: any,
        @RequestQuery() query: GetManyQuery<UserProblemProgress>,
    ) {
        const population: PopulationDto<UserProblemProgress>[] = [
            { path: "user" },
            { path: "problem" },
        ];
        return this.userProblemProgressService.getMany(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getPage", { authorize: false }, "get")
    @ApiListResponse(UserProblemProgressDto)
    @ApiCondition()
    @ApiGet()
    async getPage(
        @ReqUser() user: User,
        @RequestCondition(ConditionUserProblemProgressDto) conditions: any,
        @RequestQuery() query: GetManyQuery<UserProblemProgress>,
    ) {
        const population: PopulationDto<UserProblemProgress>[] = [
            { path: "user" },
            { path: "problem" },
        ];
        return this.userProblemProgressService.getPage(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getById", { authorize: false }, "get")
    @ApiRecordResponse(UserProblemProgressDto)
    @ApiCondition()
    @ApiGet({ mode: "one" })
    async getById(@ReqUser() user: User, @Param("id") id: string) {
        const population: PopulationDto<UserProblemProgress>[] = [
            { path: "user" },
            { path: "problem" },
        ];
        return this.userProblemProgressService.getById(user, id, {
            population,
        });
    }

    // Custom endpoints cho user progress
    @Get("my-progress")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiRecordResponse(UserProgressSummaryDto)
    @ApiOperation({
        summary: "Lấy tổng quan tiến độ của user hiện tại",
        description:
            "API để lấy tổng quan về tiến độ làm bài của user hiện tại",
    })
    async getMyProgress(
        @ReqUser() user: User,
    ): Promise<UserProgressSummaryDto> {
        return this.userProblemProgressService.getUserProgressSummary(user._id);
    }

    @Get("my-progress/solved")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiListResponse(UserProblemProgressDto)
    @ApiOperation({
        summary: "Lấy danh sách bài tập đã giải được",
        description:
            "API để lấy danh sách các bài tập mà user hiện tại đã giải được",
    })
    async getMySolvedProblems(
        @ReqUser() user: User,
    ): Promise<UserProblemProgressDto[]> {
        return this.userProblemProgressService.getSolvedProblems(user._id);
    }

    @Get("my-progress/attempted")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiListResponse(UserProblemProgressDto)
    @ApiOperation({
        summary: "Lấy danh sách bài tập đã thử làm",
        description:
            "API để lấy danh sách các bài tập mà user hiện tại đã thử làm",
    })
    async getMyAttemptedProblems(
        @ReqUser() user: User,
    ): Promise<UserProblemProgressDto[]> {
        return this.userProblemProgressService.getAttemptedProblems(user._id);
    }

    @Get("my-progress/stats")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiRecordResponse(UserProgressStatsDto)
    @ApiOperation({
        summary: "Lấy thống kê tiến độ",
        description:
            "API để lấy thống kê chi tiết về tiến độ làm bài của user hiện tại",
    })
    async getMyProgressStats(
        @ReqUser() user: User,
    ): Promise<UserProgressStatsDto> {
        return this.userProblemProgressService.getUserProgressStats(user._id);
    }

    @Get("my-progress/unsolved-attempted")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiListResponse(UserProblemProgressDto)
    @ApiOperation({
        summary: "Lấy danh sách bài tập đã thử nhưng chưa giải được",
        description:
            "API để lấy danh sách các bài tập mà user đã thử làm nhưng chưa giải được",
    })
    async getMyUnsolvedAttemptedProblems(
        @ReqUser() user: User,
    ): Promise<UserProblemProgressDto[]> {
        return this.userProblemProgressService.getUnsolvedAttemptedProblems(
            user._id,
        );
    }

    @Get("problem/:problemId/status")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiRecordResponse(ProblemStatusDto)
    @ApiOperation({
        summary: "Kiểm tra trạng thái bài tập",
        description:
            "API để kiểm tra trạng thái làm bài của user hiện tại với một bài tập cụ thể",
    })
    @ApiParam({ name: "problemId", description: "ID của bài tập" })
    async getProblemStatus(
        @Param("problemId") problemId: string,
        @ReqUser() user: User,
    ): Promise<ProblemStatusDto | null> {
        return this.userProblemProgressService.getUserProblemProgress(
            user._id,
            problemId,
        );
    }

    @Get("problem/:problemId/is-solved")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Kiểm tra đã giải được bài tập chưa",
        description:
            "API để kiểm tra user hiện tại đã giải được bài tập cụ thể chưa",
    })
    @ApiParam({ name: "problemId", description: "ID của bài tập" })
    async isProblemSolved(
        @Param("problemId") problemId: string,
        @ReqUser() user: User,
    ): Promise<{ is_solved: boolean }> {
        const isSolved = await this.userProblemProgressService.isProblemSolved(
            user._id,
            problemId,
        );
        return { is_solved: isSolved };
    }

    @Get("problem/:problemId/is-attempted")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Kiểm tra đã thử làm bài tập chưa",
        description:
            "API để kiểm tra user hiện tại đã thử làm bài tập cụ thể chưa",
    })
    @ApiParam({ name: "problemId", description: "ID của bài tập" })
    async isProblemAttempted(
        @Param("problemId") problemId: string,
        @ReqUser() user: User,
    ): Promise<{ is_attempted: boolean }> {
        const isAttempted =
            await this.userProblemProgressService.isProblemAttempted(
                user._id,
                problemId,
            );
        return { is_attempted: isAttempted };
    }

    @Put("update-progress")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiRecordResponse(UserProblemProgressDto)
    @ApiOperation({
        summary: "Cập nhật tiến độ khi submit bài",
        description: "API để cập nhật tiến độ làm bài khi có submission mới",
    })
    async updateProgress(
        @Body() dto: UpdateProgressDto,
        @ReqUser() user: User,
    ): Promise<UserProblemProgressDto> {
        return this.userProblemProgressService.updateProgressOnSubmission(
            user._id,
            dto,
        );
    }

    @Put("update-time-spent")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Cập nhật thời gian làm bài",
        description: "API để cập nhật thời gian làm bài cho một bài tập cụ thể",
    })
    @ApiQuery({ name: "problemId", description: "ID của bài tập" })
    @ApiQuery({ name: "timeSpent", description: "Thời gian làm bài (giây)" })
    async updateTimeSpent(
        @Query("problemId") problemId: string,
        @Query("timeSpent") timeSpent: number,
        @ReqUser() user: User,
    ): Promise<{ success: boolean }> {
        await this.userProblemProgressService.updateTimeSpent(
            user._id,
            problemId,
            timeSpent,
        );
        return { success: true };
    }

    // Admin endpoints
    @Get("admin/user/:userId/progress")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiRecordResponse(UserProgressSummaryDto)
    @ApiOperation({
        summary: "Lấy tiến độ của user (Admin)",
        description: "API để admin lấy tiến độ của một user cụ thể",
    })
    @ApiParam({ name: "userId", description: "ID của user" })
    async getUserProgress(
        @Param("userId") userId: string,
    ): Promise<UserProgressSummaryDto> {
        return this.userProblemProgressService.getUserProgressSummary(userId);
    }

    @Get("admin/user/:userId/solved")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiListResponse(UserProblemProgressDto)
    @ApiOperation({
        summary: "Lấy danh sách bài tập đã giải được của user (Admin)",
        description:
            "API để admin lấy danh sách bài tập đã giải được của một user cụ thể",
    })
    @ApiParam({ name: "userId", description: "ID của user" })
    async getUserSolvedProblems(
        @Param("userId") userId: string,
    ): Promise<UserProblemProgressDto[]> {
        return this.userProblemProgressService.getSolvedProblems(userId);
    }

    @Get("admin/user/:userId/stats")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiRecordResponse(UserProgressStatsDto)
    @ApiOperation({
        summary: "Lấy thống kê tiến độ của user (Admin)",
        description:
            "API để admin lấy thống kê chi tiết tiến độ của một user cụ thể",
    })
    @ApiParam({ name: "userId", description: "ID của user" })
    async getUserStats(
        @Param("userId") userId: string,
    ): Promise<UserProgressStatsDto> {
        return this.userProblemProgressService.getUserProgressStats(userId);
    }
}
