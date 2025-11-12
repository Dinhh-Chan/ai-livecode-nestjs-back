import { PartialType } from "@nestjs/mapped-types";
import { CreateCourseProblemDto } from "./create-course-problem.dto";

export class UpdateCourseProblemDto extends PartialType(
    CreateCourseProblemDto,
) {}
