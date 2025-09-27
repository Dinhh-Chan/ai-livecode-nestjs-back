import { BaseService } from "@config/service/base.service";
import { Problems } from "../entities/problems.entity";
import { ProblemsRepository } from "../repository/problems-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class ProblemsService extends BaseService<
    Problems,
    ProblemsRepository
> {
    constructor(
        @InjectRepository(Entity.PROBLEMS)
        private readonly problemsRepository: ProblemsRepository
    ) {
        super(problemsRepository);
    }
}
