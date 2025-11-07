import { BaseService } from "@config/service/base.service";
import { Cohort } from "../entities/cohorts.entity";
import { CohortsRepository } from "../repository/cohorts-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class CohortsService extends BaseService<Cohort, CohortsRepository> {
    constructor(
        @InjectRepository(Entity.COHORTS)
        private readonly cohortsRepository: CohortsRepository,
    ) {
        super(cohortsRepository);
    }
}
