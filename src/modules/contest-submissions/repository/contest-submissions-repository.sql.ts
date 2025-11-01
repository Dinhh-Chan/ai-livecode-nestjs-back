import { InjectModel } from "@nestjs/sequelize";
import { ContestSubmissionsModel } from "../models/contest-submissions.model";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { ContestSubmissionsRepository } from "./contest-submissions-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class ContestSubmissionsSqlRepository
    extends SqlRepository<ContestSubmissions>
    implements ContestSubmissionsRepository
{
    constructor(
        @InjectModel(ContestSubmissionsModel)
        private readonly contestSubmissionsModel: ModelCtor<ContestSubmissionsModel>,
    ) {
        super(contestSubmissionsModel);
    }
}
