import { BaseService } from "@config/service/base.service";
import { Topics } from "../entities/topics.entity";
import { TopicsRepository } from "../repository/topics-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import {
    BaseQueryOption,
    QueryCondition,
} from "@module/repository/common/base-repository.interface";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";

@Injectable()
export class TopicsService extends BaseService<Topics, TopicsRepository> {
    constructor(
        @InjectRepository(Entity.TOPICS)
        private readonly topicsRepository: TopicsRepository,
    ) {
        super(topicsRepository);
    }
    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<Topics>,
    ): Promise<Topics[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { topic_name: 1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }
    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<Topics>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { topic_name: 1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }
}
