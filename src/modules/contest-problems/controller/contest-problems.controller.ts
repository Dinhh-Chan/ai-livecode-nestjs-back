import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestProblemsService } from "../services/contest-problems.services";
import { ContestProblems } from "../entities/contest-problems.entity";
import { CreateContestProblemsDto } from "../dto/create-contest-problems.dto";
import { UpdateContestProblemsDto } from "../dto/update-contest-problems.dto";
import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ApiListResponse } from "@common/decorator/api.decorator";
import { ConditionContestProblemsDto } from "../dto/condition-contest-problems.dto";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { AddMultipleProblemsDto } from "../dto/add-multiple-problems.dto";

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
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
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

    @Get("contest/:contestId/problems")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách bài tập trong contest với thông tin đầy đủ",
        description:
            "API để lấy danh sách các bài tập trong contest kèm thông tin chi tiết của từng problem (tên, mô tả, độ khó, v.v.)",
    })
    @ApiQuery({
        name: "includeHidden",
        required: false,
        type: Boolean,
        description: "Có bao gồm bài tập ẩn không (mặc định: false)",
    })
    @ApiListResponse(ContestProblems)
    async getProblemsWithDetails(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Query("includeHidden") includeHidden?: boolean,
    ) {
        return this.contestProblemsService.getProblemsWithDetails(
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

    @Post(":contestId/problems/add-multiple")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Admin add nhiều problems cùng lúc vào contest",
        description:
            "API để admin thêm nhiều problems cùng lúc vào contest. Trả về kết quả chi tiết cho từng problem.",
    })
    async addMultipleProblems(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Body() dto: AddMultipleProblemsDto,
    ) {
        return this.contestProblemsService.addMultipleProblems(
            user,
            contestId,
            dto.problems,
        );
    }
}
