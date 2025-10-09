import { CreateJudgeNodeLogsDto } from "@module/judge-node-logs/dto/create-judge-node-logs.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateJudgeNodeLogsDto extends PartialType(
    CreateJudgeNodeLogsDto,
) {}
