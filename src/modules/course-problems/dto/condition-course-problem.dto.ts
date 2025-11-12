import { PartialType } from "@nestjs/mapped-types";
import { CourseProblems } from "../entities/course-problems.entity";

export class ConditionCourseProblemDto extends PartialType(CourseProblems) {}
