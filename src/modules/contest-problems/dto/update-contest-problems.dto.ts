import { PartialType } from "@nestjs/mapped-types";
import { CreateContestProblemsDto } from "./create-contest-problems.dto";

export class UpdateContestProblemsDto extends PartialType(
    CreateContestProblemsDto,
) {}
