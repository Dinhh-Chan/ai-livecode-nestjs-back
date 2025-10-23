import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ContestsService } from "../services/contests.services";
import { Contests } from "../entities/contests.entity";
import { CreateContestsDto } from "../dto/create-contests.dto";
import { UpdateContestsDto } from "../dto/update-contests.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionContestsDto } from "../dto/condition-contests.dto";

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
}
