import { PartialType } from "@nestjs/mapped-types";
import { Problems } from "../entities/problems.entity";

export class ConditionProblemsDto extends PartialType(Problems) {}
