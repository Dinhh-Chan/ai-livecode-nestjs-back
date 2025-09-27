import { InjectModel } from "@nestjs/sequelize";
import { SubTopicsModel } from "../models/sub-topics.models";
import { SubTopics } from "../entities/sub-topics.entity";
import { SubTopicsRepository } from "./sub-topics-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class SubTopicsRepositorySql extends SqlRepository<SubTopics> implements SubTopicsRepository {
    constructor(
        @InjectModel(SubTopicsModel)
        private readonly subTopicsModel: typeof SubTopicsModel,
    ) {
        super(subTopicsModel);
    }
}
