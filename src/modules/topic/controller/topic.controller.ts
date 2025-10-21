import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TopicService } from "../topic.service";
import { Topic } from "../entities/topic.entity";
import { CreateTopicDto } from "../dto/create-topic.dto";
import { UpdateTopicDto } from "../dto/update-topic.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionTopicDto } from "../dto/condition-topic.dto";

@Controller("topic")
@ApiTags("Topic")
export class TopicController extends BaseControllerFactory<Topic>(
    Topic,
    ConditionTopicDto,
    CreateTopicDto,
    UpdateTopicDto,
) {
    constructor(private readonly topicService: TopicService) {
        super(topicService);
    }
}
