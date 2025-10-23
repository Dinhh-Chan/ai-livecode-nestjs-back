import { PartialType } from "@nestjs/mapped-types";
import { CreateContestsDto } from "./create-contests.dto";

export class UpdateContestsDto extends PartialType(CreateContestsDto) {}
