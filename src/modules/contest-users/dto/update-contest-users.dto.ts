import { PartialType } from "@nestjs/mapped-types";
import { CreateContestUsersDto } from "./create-contest-users.dto";

export class UpdateContestUsersDto extends PartialType(CreateContestUsersDto) {}
