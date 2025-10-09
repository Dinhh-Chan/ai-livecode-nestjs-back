import { CreateStudentSubmissionsDto } from "@module/student-submissions/dto/create-student-submissions.dto";
import { PartialType } from "@nestjs/swagger";

export class UpdateStudentSubmissionsDto extends PartialType(
    CreateStudentSubmissionsDto,
) {}
