import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestUsersService } from "../services/contest-users.services";
import { ContestUsers } from "../entities/contest-users.entity";
import { CreateContestUsersDto } from "../dto/create-contest-users.dto";
import { UpdateContestUsersDto } from "../dto/update-contest-users.dto";
import { RequestJoinContestDto } from "../dto/request-join-contest.dto";
import { Body, Controller, Param, Post, Put } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ApiRecordResponse } from "@common/decorator/api.decorator";
import { ConditionContestUsersDto } from "../dto/condition-contest-users.dto";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";

@Controller("contest-users")
@ApiTags("Contest Users")
export class ContestUsersController extends BaseControllerFactory<ContestUsers>(
    ContestUsers,
    ConditionContestUsersDto,
    CreateContestUsersDto,
    UpdateContestUsersDto,
) {
    constructor(private readonly contestUsersService: ContestUsersService) {
        super(contestUsersService);
    }

    @Post("request-join")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "User request tham gia contest",
        description:
            "API để user gửi request tham gia contest (status = PENDING)",
    })
    @ApiRecordResponse(ContestUsers)
    async requestJoin(
        @ReqUser() user: User,
        @Body() dto: RequestJoinContestDto,
    ) {
        return this.contestUsersService.requestJoin(user, dto.contest_id);
    }

    @Post(":contestId/users/:userId/increment")
    @ApiOperation({ summary: "Tăng số bài ACCEPT cho user trong contest" })
    async incrementAccepted(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("userId") userId: string,
        @Body("by") by: number = 1,
    ) {
        return this.contestUsersService.incrementAcceptedCount(
            user,
            contestId,
            userId,
            by,
        );
    }

    @Put(":contestId/users/:userId/manager")
    @ApiOperation({ summary: "Đặt quyền quản lý contest cho user" })
    async setManager(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("userId") userId: string,
        @Body("isManager") isManager: boolean,
    ) {
        return this.contestUsersService.setManager(
            user,
            contestId,
            userId,
            isManager,
        );
    }

    @Put(":contestId/users/:userId/approve")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Admin approve request tham gia contest",
        description:
            "API để admin xác nhận cho phép user tham gia contest (status = ENROLLED)",
    })
    @ApiRecordResponse(ContestUsers)
    async approveRequest(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("userId") userId: string,
    ) {
        return this.contestUsersService.approveRequest(user, contestId, userId);
    }

    @Put(":contestId/users/:userId/reject")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Admin reject request tham gia contest",
        description:
            "API để admin từ chối request tham gia contest (status = REJECTED)",
    })
    @ApiRecordResponse(ContestUsers)
    async rejectRequest(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("userId") userId: string,
    ) {
        return this.contestUsersService.rejectRequest(user, contestId, userId);
    }

    @Post(":contestId/users/:userId/add")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Admin add user trực tiếp vào contest",
        description:
            "API để admin thêm user trực tiếp vào contest (status = ENROLLED)",
    })
    @ApiRecordResponse(ContestUsers)
    async addUser(
        @ReqUser() user: User,
        @Param("contestId") contestId: string,
        @Param("userId") userId: string,
    ) {
        return this.contestUsersService.addUser(user, contestId, userId);
    }
}
