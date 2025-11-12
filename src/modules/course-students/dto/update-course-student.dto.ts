import { PartialType } from "@nestjs/mapped-types";
import { CreateCourseStudentDto } from "./create-course-student.dto";

export class UpdateCourseStudentDto extends PartialType(
    CreateCourseStudentDto,
) {}
