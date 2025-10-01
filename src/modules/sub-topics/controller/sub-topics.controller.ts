import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { SubTopicsService } from "../services/sub-topics.services";
import { SubTopics } from "../entities/sub-topics.entity";
import { CreateSubTopicsDto } from "../dto/create-sub-topics.dto";
import { UpdateSubTopicsDto } from "../dto/update-sub-topics.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionSubTopicsDto } from "../dto/condition-sub-topics.dto";

@Controller("sub-topics")
@ApiTags("Sub Topics")
export class SubTopicsController extends BaseControllerFactory<SubTopics>(
    SubTopics,
    ConditionSubTopicsDto,
    CreateSubTopicsDto,
    UpdateSubTopicsDto,
) {
    constructor(private readonly subTopicsService: SubTopicsService) {
        super(subTopicsService);
    }
}
