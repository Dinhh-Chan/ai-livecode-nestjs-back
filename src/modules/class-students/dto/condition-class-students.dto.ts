import { PartialType } from "@nestjs/mapped-types";
import { ClassStudents } from "../entities/class-students.entity";

export class ConditionClassStudentsDto extends PartialType(ClassStudents) {}
