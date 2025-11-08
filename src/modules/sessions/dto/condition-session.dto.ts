import { PartialType } from "@nestjs/mapped-types";
import { Session } from "../entities/sessions.entity";

export class ConditionSessionDto extends PartialType(Session) {}
