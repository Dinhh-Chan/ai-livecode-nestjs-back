import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ProblemsService } from "../services/problems.services";
import { Problems } from "../entities/problems.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { UpdateProblemsDto } from "../dto/update-problems.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionProblemsDto } from "../dto/condition-problems.dto";

@Controller("problems")
@ApiTags("Problems")
export class ProblemsController extends BaseControllerFactory<Problems>(
    Problems,
    ConditionProblemsDto,
    CreateProblemsDto,
    UpdateProblemsDto
) {
    constructor(private readonly problemsService: ProblemsService) {
        super(problemsService);
    }
}
