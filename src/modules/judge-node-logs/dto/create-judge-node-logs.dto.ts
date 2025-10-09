import { OmitType } from "@nestjs/swagger";
import { JudgeNodeLogs } from "../entities/judge-node-logs.entity";

export class CreateJudgeNodeLogsDto extends OmitType(JudgeNodeLogs, ["_id"]) {}
