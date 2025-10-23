import { PartialType } from "@nestjs/mapped-types";
import { CreateClassStudentsDto } from "./create-class-students.dto";

export class UpdateClassStudentsDto extends PartialType(
    CreateClassStudentsDto,
) {}
