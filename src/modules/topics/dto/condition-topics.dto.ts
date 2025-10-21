import { PartialType } from "@nestjs/mapped-types";
import { Topics } from "../entities/topics.entity";

export class ConditionTopicsDto extends PartialType(Topics) {}
