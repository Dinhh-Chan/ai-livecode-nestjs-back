import { BaseService } from "@config/service/base.service";
import { Topics } from "../entities/topics.entity";
import { TopicsRepository } from "../repository/topics-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class TopicsService extends BaseService<
    Topics,
    TopicsRepository
> {
    constructor(
        @InjectRepository(Entity.TOPICS)
        private readonly topicsRepository: TopicsRepository
    ) {
        super(topicsRepository);
    }
}
