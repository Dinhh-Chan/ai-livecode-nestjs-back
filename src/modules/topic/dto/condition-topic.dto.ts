import { PartialType } from "@nestjs/mapped-types";
import { Topic } from "../entities/topic.entity";

export class ConditionTopicDto extends PartialType(Topic) {}
