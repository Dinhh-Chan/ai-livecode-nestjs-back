import { OmitType } from "@nestjs/swagger";
import { StudentSubmissions } from "../entities/student-submissions.entity";

export class CreateStudentSubmissionsDto extends OmitType(StudentSubmissions, [
    "_id",
]) {}
