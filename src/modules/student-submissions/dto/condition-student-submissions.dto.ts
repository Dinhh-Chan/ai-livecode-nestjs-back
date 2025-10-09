import { PartialType } from "@nestjs/mapped-types";
import { StudentSubmissions } from "../entities/student-submissions.entity";

export class ConditionStudentSubmissionsDto extends PartialType(
    StudentSubmissions,
) {}
