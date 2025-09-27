import { PartialType } from "@nestjs/mapped-types";
import { CreateSubTopicsDto } from "./create-sub-topics.dto";

export class UpdateSubTopicsDto extends PartialType(CreateSubTopicsDto) {}
