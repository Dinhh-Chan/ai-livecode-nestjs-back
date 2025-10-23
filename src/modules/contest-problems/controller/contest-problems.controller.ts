import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestProblemsService } from "../services/contest-problems.services";
import { ContestProblems } from "../entities/contest-problems.entity";
import { CreateContestProblemsDto } from "../dto/create-contest-problems.dto";
import { UpdateContestProblemsDto } from "../dto/update-contest-problems.dto";
import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ConditionContestProblemsDto } from "../dto/condition-contest-problems.dto";
import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";

@Controller("contest-problems")
@ApiTags("Contest Problems")
export class ContestProblemsController extends BaseControllerFactory<ContestProblems>(
    ContestProblems,
    ConditionContestProblemsDto,
    CreateContestProblemsDto,
    UpdateContestProblemsDto,
) {
    constructor(
        private readonly contestProblemsService: ContestProblemsService,
    ) {
        super(contestProblemsService);
    }

    @Get("contest/:contestId")
    @ApiOperation({ summary: "Lấy danh sách bài tập trong contest" })
    @ApiQuery({
        name: "includeHidden",
        required: false,
        type: Boolean,
        description: "Có bao gồm bài tập ẩn không (mặc định: false)",
    })
    async getProblemsByContest(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Query("includeHidden") includeHidden?: boolean,
    ) {
        return this.contestProblemsService.getProblemsByContest(
            user,
            contestId,
            includeHidden || false,
        );
    }

    @Put(":contestId/:problemId/order")
    @ApiOperation({ summary: "Cập nhật thứ tự bài tập trong contest" })
    async updateOrder(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("problemId") problemId: string,
        @Body("order") order: number,
    ) {
        return this.contestProblemsService.updateOrder(
            user,
            contestId,
            problemId,
            order,
        );
    }

    @Put(":contestId/:problemId/score")
    @ApiOperation({ summary: "Cập nhật điểm số bài tập trong contest" })
    async updateScore(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("problemId") problemId: string,
        @Body("score") score: number,
    ) {
        return this.contestProblemsService.updateScore(
            user,
            contestId,
            problemId,
            score,
        );
    }

    @Put(":contestId/:problemId/visibility")
    @ApiOperation({ summary: "Ẩn/hiện bài tập trong contest" })
    async toggleVisibility(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("problemId") problemId: string,
        @Body("isVisible") isVisible: boolean,
    ) {
        return this.contestProblemsService.toggleVisibility(
            user,
            contestId,
            problemId,
            isVisible,
        );
    }
}
