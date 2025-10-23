import { PartialType } from "@nestjs/mapped-types";
import { Class } from "../entities/class.entity";

export class ConditionClassDto extends PartialType(Class) {}
