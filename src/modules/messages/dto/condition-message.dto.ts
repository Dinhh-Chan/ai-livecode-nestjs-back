import { PartialType } from "@nestjs/mapped-types";
import { Message } from "../entities/messages.entity";

export class ConditionMessageDto extends PartialType(Message) {}
