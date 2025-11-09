import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestSubmissionsService } from "../services/contest-submissions.services";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { CreateContestSubmissionsDto } from "../dto/create-contest-submissions.dto";
import { UpdateContestSubmissionsDto } from "../dto/update-contest-submissions.dto";
import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConditionContestSubmissionsDto } from "../dto/condition-contest-submissions.dto";
import { SystemRole } from "@module/user/common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SubmitContestCodeDto } from "../dto/submit-contest-code.dto";
import { ApiListResponse } from "@common/decorator/api.decorator";

@Controller("contest-submissions")
@ApiTags("Contest Submissions")
export class ContestSubmissionsController extends BaseControllerFactory<ContestSubmissions>(
    ContestSubmissions,
    ConditionContestSubmissionsDto,
    CreateContestSubmissionsDto,
    UpdateContestSubmissionsDto,
    {
        authorize: true,
        routes: {
            create: {
                roles: [SystemRole.ADMIN],
            },
            getById: {
                roles: [
                    SystemRole.USER,
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
            getOne: {
                roles: [
                    SystemRole.USER,
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
            getMany: {
                roles: [
                    SystemRole.USER,
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
            },
            getPage: {
                roles: [
                    SystemRole.USER,
                    SystemRole.ADMIN,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                ],
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
        private readonly contestSubmissionsService: ContestSubmissionsService,
    ) {
        super(contestSubmissionsService);
    }

    @Post("submit")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Submit code trong contest",
        description:
            "API để submit code trong contest. Lưu tất cả submissions vào ContestSubmissions (cả AC và không AC). Code được submit qua StudentSubmissionsService. Nếu AC và là lần đầu AC problem này trong contest, sẽ tăng accepted_count.",
    })
    @ApiResponse({
        status: 201,
        description: "Submit thành công",
    })
    async submitCode(@ReqUser() user: User, @Body() dto: SubmitContestCodeDto) {
        return this.contestSubmissionsService.submitCode(user, dto);
    }

    @Get("contest/:contestId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách submissions trong contest",
        description:
            "API để lấy danh sách submissions trong contest kèm thông tin user và problem",
    })
    async getContestSubmissions(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
    ) {
        return this.contestSubmissionsService.getContestAllSubmissions(
            user,
            contestId,
        );
    }

    @Get("contest/:contestId/all")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy tất cả submissions của tất cả users trong contest",
        description:
            "Trả về toàn bộ submissions trong contest kèm thông tin cơ bản của user (username, fullname, studentPtitCode) và thông tin bài tập (name, description)",
    })
    async getContestAllSubmissions(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
    ) {
        return this.contestSubmissionsService.getContestAllSubmissions(
            user,
            contestId,
        );
    }

    @Get("contest/:contestId/problem/:problemId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary:
            "Lấy danh sách submissions của user cho một problem trong contest",
        description:
            "API để lấy danh sách các bài đã AC của user cho một problem cụ thể trong contest",
    })
    @ApiListResponse(ContestSubmissions)
    async getContestProblemSubmissions(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("problemId") problemId: string,
    ) {
        return this.contestSubmissionsService.getContestProblemSubmissions(
            user,
            contestId,
            problemId,
        );
    }
}
