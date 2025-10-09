import { OmitType } from "@nestjs/swagger";
import { JudgeNodes } from "../entities/judge-nodes.entity";

export class CreateJudgeNodesDto extends OmitType(JudgeNodes, ["_id"]) {}
