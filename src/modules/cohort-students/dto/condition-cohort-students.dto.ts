import { PartialType } from "@nestjs/mapped-types";
import { CohortStudents } from "../entities/cohort-students.entity";

export class ConditionCohortStudentsDto extends PartialType(CohortStudents) {}
