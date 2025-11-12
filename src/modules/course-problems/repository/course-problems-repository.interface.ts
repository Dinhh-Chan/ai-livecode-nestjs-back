import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { CourseProblems } from "../entities/course-problems.entity";

export interface CourseProblemsRepository
    extends BaseRepository<CourseProblems> {
    findByCourse(
        courseId: string,
        includeHidden?: boolean,
    ): Promise<CourseProblems[]>;
}
