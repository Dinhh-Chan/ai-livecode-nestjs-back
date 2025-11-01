import { BaseService } from "@config/service/base.service";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { ContestSubmissionsRepository } from "../repository/contest-submissions-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class ContestSubmissionsService extends BaseService<
    ContestSubmissions,
    ContestSubmissionsRepository
> {
    constructor(
        @InjectRepository(Entity.CONTEST_SUBMISSIONS)
        private readonly contestSubmissionsRepository: ContestSubmissionsRepository,
    ) {
        super(contestSubmissionsRepository);
    }

    // Các method custom cho ContestSubmissions nếu cần
}
