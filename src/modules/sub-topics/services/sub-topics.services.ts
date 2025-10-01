import { BaseService } from "@config/service/base.service";
import { SubTopics } from "../entities/sub-topics.entity";
import { SubTopicsRepository } from "../repository/sub-topics-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class SubTopicsService extends BaseService<
    SubTopics,
    SubTopicsRepository
> {
    constructor(
        @InjectRepository(Entity.SUB_TOPICS)
        private readonly subTopicsRepository: SubTopicsRepository,
    ) {
        super(subTopicsRepository);
    }
}
