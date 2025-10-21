import { PartialType } from "@nestjs/mapped-types";
import { CreateProblemsDto } from "./create-problems.dto";

export class UpdateProblemsDto extends PartialType(CreateProblemsDto) {}
