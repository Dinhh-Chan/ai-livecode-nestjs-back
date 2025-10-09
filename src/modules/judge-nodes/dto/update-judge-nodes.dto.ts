import { CreateJudgeNodesDto } from "@module/judge-nodes/dto/create-judge-nodes.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateJudgeNodesDto extends PartialType(CreateJudgeNodesDto) {}
