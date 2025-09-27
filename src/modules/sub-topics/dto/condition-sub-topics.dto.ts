import { PartialType } from "@nestjs/mapped-types";
import { SubTopics } from "../entities/sub-topics.entity";

export class ConditionSubTopicsDto extends PartialType(SubTopics) {}
