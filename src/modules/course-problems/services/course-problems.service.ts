import { BaseService } from "@config/service/base.service";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { Entity } from "@module/repository";
import { InjectRepository } from "@module/repository/common/repository";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ProblemsService } from "@module/problems/services/problems.services";
import { CourseProblems } from "../entities/course-problems.entity";
import { CourseProblemsRepository } from "../repository/course-problems-repository.interface";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class CourseProblemsService extends BaseService<
    CourseProblems,
    CourseProblemsRepository
> {
    constructor(
        @InjectRepository(Entity.COURSE_PROBLEMS)
        private readonly courseProblemsRepository: CourseProblemsRepository,
        @Inject(forwardRef(() => ProblemsService))
        private readonly problemsService: ProblemsService,
    ) {
        super(courseProblemsRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<CourseProblems>,
    ): Promise<CourseProblems[]> {
        const withSort = {
            ...query,
            sort: query?.sort || { order_index: 1 },
        };
        return super.getMany(user, conditions, withSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<CourseProblems>,
    ): Promise<any> {
        const withSort = {
            ...query,
            sort: query?.sort || { order_index: 1 },
        };
        return super.getPage(user, conditions, withSort);
    }

    findByCourse(courseId: string, includeHidden: boolean = false) {
        return this.courseProblemsRepository.findByCourse(
            courseId,
            includeHidden,
        );
    }

    async findWithDetails(
        user: User,
        courseId: string,
        includeHidden: boolean = false,
    ) {
        const courseProblems = await this.findByCourse(courseId, includeHidden);
        if (!courseProblems.length) {
            return [];
        }
        const problemIds = courseProblems.map((cp) => cp.problem_id);
        const problems = await this.problemsService.getMany(
            user,
            { _id: { $in: problemIds } } as any,
            {},
        );
        const problemMap = new Map<any, any>(
            problems.map((p: any) => [p._id, p]),
        );
        return courseProblems.map((cp) => ({
            ...cp,
            problem: problemMap.get(cp.problem_id) || null,
        }));
    }
}
