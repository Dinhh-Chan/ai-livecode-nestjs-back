import { PartialType } from "@nestjs/mapped-types";
import { ContestUsers } from "../entities/contest-users.entity";

export class ConditionContestUsersDto extends PartialType(ContestUsers) {}
