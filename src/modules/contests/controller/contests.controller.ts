import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestsService } from "../services/contests.services";
import { Contests } from "../entities/contests.entity";
import { CreateContestsDto } from "../dto/create-contests.dto";
import { UpdateContestsDto } from "../dto/update-contests.dto";
import { Controller, Get, Post, Param, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConditionContestsDto } from "../dto/condition-contests.dto";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ContestUsers } from "@module/contest-users/entities/contest-users.entity";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import {
    ApiListResponse,
    ApiPageResponse,
} from "@common/decorator/api.decorator";
import { ContestRankingItemDto } from "../dto/contest-ranking-item.dto";
import { CreateContestWithRandomProblemsDto } from "../dto/create-contest-with-random-problems.dto";

@Controller("contests")
@ApiTags("Contests")
export class ContestsController extends BaseControllerFactory<Contests>(
    Contests,
    ConditionContestsDto,
    CreateContestsDto,
    UpdateContestsDto,
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
        },
    },
) {
    constructor(private readonly contestsService: ContestsService) {
        super(contestsService);
    }

    @Get("ongoing")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest đang diễn ra",
        description:
            "API để lấy danh sách các contest đang trong thời gian diễn ra (start_time <= now <= end_time)",
    })
    @ApiListResponse(Contests)
    async getOngoingContests(
        @ReqUser() user: User,
        @RequestQuery() query: GetManyQuery<Contests>,
    ) {
        return this.contestsService.getOngoingContests(user, query);
    }

    @Get("ongoing/page")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest đang diễn ra (có phân trang)",
        description:
            "API để lấy danh sách các contest đang trong thời gian diễn ra với phân trang",
    })
    @ApiPageResponse(Contests)
    async getOngoingContestsPage(
        @ReqUser() user: User,
        @RequestQuery() query: GetPageQuery<Contests>,
    ) {
        return this.contestsService.getOngoingContestsPage(user, query);
    }

    @Get("not-ended")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest chưa kết thúc",
        description:
            "API để lấy danh sách các contest chưa kết thúc (end_time > now), bao gồm cả contest đang diễn ra và chưa bắt đầu",
    })
    @ApiListResponse(Contests)
    async getNotEndedContests(
        @ReqUser() user: User,
        @RequestQuery() query: GetManyQuery<Contests>,
    ) {
        return this.contestsService.getNotEndedContests(user, query);
    }

    @Get("not-ended/page")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest chưa kết thúc (có phân trang)",
        description:
            "API để lấy danh sách các contest chưa kết thúc với phân trang",
    })
    @ApiPageResponse(Contests)
    async getNotEndedContestsPage(
        @ReqUser() user: User,
        @RequestQuery() query: GetPageQuery<Contests>,
    ) {
        return this.contestsService.getNotEndedContestsPage(user, query);
    }

    @Get("mycontest")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest của user",
        description:
            "API để lấy danh sách các contest mà user đang tham gia (ENROLLED) và đang pending (PENDING)",
    })
    @ApiListResponse(Contests)
    async getMyContests(
        @ReqUser() user: User,
        @RequestQuery() query: GetManyQuery<ContestUsers>,
    ) {
        return this.contestsService.getMyContests(user, query);
    }

    @Get("mycontest/page")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách contest của user (có phân trang)",
        description:
            "API để lấy danh sách các contest mà user đang tham gia với phân trang",
    })
    @ApiPageResponse(Contests)
    async getMyContestsPage(
        @ReqUser() user: User,
        @RequestQuery() query: GetPageQuery<ContestUsers>,
    ) {
        return this.contestsService.getMyContestsPage(user, query);
    }

    @Get(":contestId/ranking")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy bảng xếp hạng của contest",
        description:
            "API để lấy bảng xếp hạng của contest (giống VNOI): rank, user info, accepted_count, và trạng thái giải của từng bài tập",
    })
    @ApiListResponse(ContestRankingItemDto)
    async getContestRanking(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Res() res: Response,
    ) {
        const result = await this.contestsService.getContestRanking(
            user,
            contestId,
        );
        return res.json({
            success: true,
            ...result,
        });
    }

    @Post("create-with-random-problems")
    @AllowSystemRoles(SystemRole.ADMIN, SystemRole.TEACHER)
    @ApiOperation({
        summary: "Tạo contest với các bài tập được chọn ngẫu nhiên",
        description:
            "API để tạo contest mới với các bài tập được chọn ngẫu nhiên theo cấu hình: topic, sub_topic, độ khó, số lượng bài, và loại bài tập",
    })
    @ApiResponse({
        status: 201,
        description: "Contest được tạo thành công",
        type: Contests,
    })
    async createContestWithRandomProblems(
        @ReqUser() user: User,
        @Body() dto: CreateContestWithRandomProblemsDto,
    ) {
        return this.contestsService.createContestWithRandomProblems(user, dto);
    }
}
