import { PartialType } from "@nestjs/mapped-types";
import { CreateCohortStudentsDto } from "./create-cohort-students.dto";

export class UpdateCohortStudentsDto extends PartialType(
    CreateCohortStudentsDto,
) {}
