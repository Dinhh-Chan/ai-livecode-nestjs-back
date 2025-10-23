import { BaseService } from "@config/service/base.service";
import { ContestUsers } from "../entities/contest-users.entity";
import { ContestUsersRepository } from "../repository/contest-users-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { GetManyQuery, GetPageQuery } from "@common/constant";

@Injectable()
export class ContestUsersService extends BaseService<
    ContestUsers,
    ContestUsersRepository
> {
    constructor(
        @InjectRepository(Entity.CONTEST_USERS)
        private readonly contestUsersRepository: ContestUsersRepository,
    ) {
        super(contestUsersRepository);
    }

    async getMany(
        user: User,
        conditions: any,
        query: GetManyQuery<ContestUsers>,
    ): Promise<ContestUsers[]> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { accepted_count: -1, order_index: 1 },
        };

        return super.getMany(user, conditions, queryWithDefaultSort);
    }

    async getPage(
        user: User,
        conditions: any,
        query: GetPageQuery<ContestUsers>,
    ): Promise<any> {
        const queryWithDefaultSort = {
            ...query,
            sort: query.sort || { accepted_count: -1, order_index: 1 },
        };
        return super.getPage(user, conditions, queryWithDefaultSort);
    }

    async incrementAcceptedCount(
        user: User,
        contestId: string,
        userId: string,
        incrementBy: number = 1,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { $inc: { accepted_count: incrementBy } } as any,
        );
    }

    async setManager(
        user: User,
        contestId: string,
        userId: string,
        isManager: boolean,
    ) {
        return this.updateOne(
            user,
            { contest_id: contestId, user_id: userId } as any,
            { is_manager: isManager } as any,
        );
    }
}
