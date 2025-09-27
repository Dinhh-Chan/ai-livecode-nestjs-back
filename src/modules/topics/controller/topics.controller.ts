import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TopicsService } from "../services/topics.services";
import { Topics } from "../entities/topics.entity";
import { CreateTopicsDto } from "../dto/create-topics.dto";
import { UpdateTopicsDto } from "../dto/update-topics.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionTopicsDto } from "../dto/condition-topics.dto";

@Controller("topics")
@ApiTags("Topics")
export class TopicsController extends BaseControllerFactory<Topics>(
    Topics,
    ConditionTopicsDto,
    CreateTopicsDto,
    UpdateTopicsDto
) {
    constructor(private readonly topicsService: TopicsService) {
        super(topicsService);
    }
}
