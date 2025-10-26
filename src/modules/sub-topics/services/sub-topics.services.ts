import { BaseService } from "@config/service/base.service";
import { SubTopics } from "../entities/sub-topics.entity";
import { SubTopicsRepository } from "../repository/sub-topics-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";
import { BaseQueryOption } from "@module/repository/common/base-repository.interface";
import { ProblemsService } from "../../problems/services/problems.services";

@Injectable()
export class SubTopicsService extends BaseService<
    SubTopics,
    SubTopicsRepository
> {
    constructor(
        @InjectRepository(Entity.SUB_TOPICS)
        private readonly subTopicsRepository: SubTopicsRepository,
        private readonly problemsService: ProblemsService,
    ) {
        super(subTopicsRepository);
    }

    /**
     * Lấy danh sách sub-topics theo topic ID
     */
    async getByTopicId(
        user: User,
        topicId: string,
        query?: GetManyQuery<SubTopics> & BaseQueryOption<unknown>,
    ) {
        return this.getMany(user, { topic_id: topicId }, query);
    }
    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<SubTopics>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { sub_topic_name: 1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }
    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<SubTopics>,
    ): Promise<SubTopics[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { sub_topic_name: 1 },
        };
        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    /**
     * Lấy danh sách sub-topics theo topic ID với problem counts
     */
    async getByTopicIdWithProblemCounts(
        user: User,
        topicId: string,
        query?: GetManyQuery<SubTopics> & BaseQueryOption<unknown>,
    ) {
        const subTopics = await this.getMany(
            user,
            { topic_id: topicId },
            query,
        );

        // Lấy danh sách sub-topic IDs
        const subTopicIds = subTopics.map((st) => st._id);

        // Đếm problems cho mỗi sub-topic
        const problemCounts =
            await this.problemsService.countProblemsBySubTopics(
                user,
                subTopicIds,
            );

        // Thêm problem_counts vào mỗi sub-topic
        const subTopicsWithCounts = subTopics.map((subTopic) => ({
            ...subTopic,
            problem_counts: problemCounts[subTopic._id] || 0,
        }));

        return subTopicsWithCounts;
    }

    /**
     * Lấy danh sách sub-topics với problem counts
     */
    async getManyWithProblemCounts(
        user: User,
        conditions: any,
        query: GetManyQuery<SubTopics>,
    ) {
        const subTopics = await this.getMany(user, conditions, query);

        // Lấy danh sách sub-topic IDs
        const subTopicIds = subTopics.map((st) => st._id);

        // Đếm problems cho mỗi sub-topic
        const problemCounts =
            await this.problemsService.countProblemsBySubTopics(
                user,
                subTopicIds,
            );

        // Thêm problem_counts vào mỗi sub-topic
        const subTopicsWithCounts = subTopics.map((subTopic) => ({
            ...subTopic,
            problem_counts: problemCounts[subTopic._id] || 0,
        }));

        return subTopicsWithCounts;
    }
}
