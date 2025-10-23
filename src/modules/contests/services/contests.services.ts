import { BaseService } from "@config/service/base.service";
import { Contests } from "../entities/contests.entity";
import { ContestsRepository } from "../repository/contests-repository.interface";
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
export class ContestsService extends BaseService<Contests, ContestsRepository> {
    constructor(
        @InjectRepository(Entity.CONTESTS)
        private readonly contestsRepository: ContestsRepository,
    ) {
        super(contestsRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<Contests>,
    ): Promise<Contests[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { created_time: -1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<Contests>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { created_time: -1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }
}
