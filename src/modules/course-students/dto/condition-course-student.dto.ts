import { PartialType } from "@nestjs/mapped-types";
import { CourseStudents } from "../entities/course-students.entity";

export class ConditionCourseStudentDto extends PartialType(CourseStudents) {}
