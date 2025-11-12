import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { InjectModel } from "@nestjs/sequelize";
import { ModelCtor } from "sequelize-typescript";
import { CourseProblems } from "../entities/course-problems.entity";
import { CourseProblemsRepository } from "./course-problems-repository.interface";
import { CourseProblemsModel } from "../models/course-problems.model";

export class CourseProblemsSqlRepository
    extends SqlRepository<CourseProblems>
    implements CourseProblemsRepository
{
    constructor(
        @InjectModel(CourseProblemsModel)
        private readonly courseProblemsModel: ModelCtor<CourseProblemsModel>,
    ) {
        super(courseProblemsModel, {
            populate: {
                getMany: [],
                getById: [],
            },
        });
    }

    findByCourse(
        courseId: string,
        includeHidden: boolean = false,
    ): Promise<CourseProblems[]> {
        const conditions: any = { course_id: courseId };
        if (!includeHidden) {
            conditions.is_visible = true;
        }
        return this.getMany(conditions, { sort: { order_index: 1 } });
    }
}
