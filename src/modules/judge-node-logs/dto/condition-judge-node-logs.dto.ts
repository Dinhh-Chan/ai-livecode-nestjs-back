import { PartialType } from "@nestjs/mapped-types";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";

export class ConditionJudgeNodeLogsDto extends PartialType(JudgeNodeLogs) {}
