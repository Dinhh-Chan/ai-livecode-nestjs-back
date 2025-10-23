import { PartialType } from "@nestjs/mapped-types";
import { Contests } from "../entities/contests.entity";

export class ConditionContestsDto extends PartialType(Contests) {}
