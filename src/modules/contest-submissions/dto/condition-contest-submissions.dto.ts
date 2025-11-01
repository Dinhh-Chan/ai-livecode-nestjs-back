import { PartialType } from "@nestjs/mapped-types";
import { ContestSubmissions } from "../entities/contest-submissions.entity";

export class ConditionContestSubmissionsDto extends PartialType(
    ContestSubmissions,
) {}
