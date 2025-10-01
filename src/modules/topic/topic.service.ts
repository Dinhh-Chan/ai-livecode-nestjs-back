import { BaseService } from "@config/service/base.service";
import { Topic } from "./entities/topic.entity";
import { TopicRepository } from "./repository/topic-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class TopicService extends BaseService<Topic, TopicRepository> {
    constructor(
        @InjectRepository(Entity.TOPICS)
        private readonly topicRepository: TopicRepository,
    ) {
        super(topicRepository);
    }
}
