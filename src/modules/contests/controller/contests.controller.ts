import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestsService } from "../services/contests.services";
import { Contests } from "../entities/contests.entity";
import { CreateContestsDto } from "../dto/create-contests.dto";
import { UpdateContestsDto } from "../dto/update-contests.dto";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConditionContestsDto } from "../dto/condition-contests.dto";
import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { ContestUsers } from "@module/contest-users/entities/contest-users.entity";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import {
    ApiListResponse,
    ApiPageResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { ContestRankingDto } from "../dto/contest-ranking.dto";

@Controller("contests")
@ApiTags("Contests")
export class ContestsController extends BaseControllerFactory<Contests>(
    Contests,
    ConditionContestsDto,
    CreateContestsDto,
    UpdateContestsDto,
) {
    constructor(private readonly contestsService: ContestsService) {
        super(contestsService);
    }

    @Get("ongoing")
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
    @ApiOperation({
        summary: "Lấy bảng xếp hạng của contest",
        description:
            "API để lấy bảng xếp hạng của contest (giống VNOI): rank, user info, accepted_count, và trạng thái giải của từng bài tập",
    })
    @ApiRecordResponse(ContestRankingDto)
    async getContestRanking(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
    ) {
        return this.contestsService.getContestRanking(user, contestId);
    }
}
