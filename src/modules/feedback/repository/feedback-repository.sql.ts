import { InjectModel } from "@nestjs/sequelize";
import { FeedbackModel } from "../models/feedback.model";
import { Feedback } from "../entities/feedback.entity";
import { FeedbackRepository } from "./feedback-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class FeedbackSqlRepository
    extends SqlRepository<Feedback>
    implements FeedbackRepository
{
    constructor(
        @InjectModel(FeedbackModel)
        private readonly feedbackModel: ModelCtor<FeedbackModel>,
    ) {
        super(feedbackModel);
    }
}
