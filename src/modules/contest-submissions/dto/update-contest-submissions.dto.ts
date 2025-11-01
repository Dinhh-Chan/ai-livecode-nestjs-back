import { PartialType } from "@nestjs/mapped-types";
import { CreateContestSubmissionsDto } from "./create-contest-submissions.dto";

export class UpdateContestSubmissionsDto extends PartialType(
    CreateContestSubmissionsDto,
) {}
