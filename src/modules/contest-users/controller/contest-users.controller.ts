import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestUsersService } from "../services/contest-users.services";
import { ContestUsers } from "../entities/contest-users.entity";
import { CreateContestUsersDto } from "../dto/create-contest-users.dto";
import { UpdateContestUsersDto } from "../dto/update-contest-users.dto";
import { Body, Controller, Param, Post, Put } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConditionContestUsersDto } from "../dto/condition-contest-users.dto";
import { ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";

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
}
