import { InjectModel } from "@nestjs/sequelize";
import { TopicsModel } from "../models/topics.models";
import { Topics } from "../entities/topics.entity";
import { TopicsRepository } from "./topics-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class TopicsRepositorySql extends SqlRepository<Topics> implements TopicsRepository {
    constructor(
        @InjectModel(TopicsModel)
        private readonly topicsModel: typeof TopicsModel,
    ) {
        super(topicsModel);
    }
}
