import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestSubmissionsService } from "../services/contest-submissions.services";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { CreateContestSubmissionsDto } from "../dto/create-contest-submissions.dto";
import { UpdateContestSubmissionsDto } from "../dto/update-contest-submissions.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionContestSubmissionsDto } from "../dto/condition-contest-submissions.dto";
import { SystemRole } from "@module/user/common/constant";

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
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getOne: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getMany: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getPage: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
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
}
