import { PartialType } from "@nestjs/mapped-types";
import { ContestProblems } from "../entities/contest-problems.entity";

export class ConditionContestProblemsDto extends PartialType(ContestProblems) {}
