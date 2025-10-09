import { PartialType } from "@nestjs/mapped-types";
import { JudgeNodes } from "../entities/judge-nodes.entity";

export class ConditionJudgeNodesDto extends PartialType(JudgeNodes) {}
