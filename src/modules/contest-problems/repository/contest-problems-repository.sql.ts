import { InjectModel } from "@nestjs/sequelize";
import { ContestProblemsModel } from "../models/contest-problems.models";
import { ContestProblems } from "../entities/contest-problems.entity";
import { ContestProblemsRepository } from "./contest-problems-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class ContestProblemsRepositorySql
    extends SqlRepository<ContestProblems>
    implements ContestProblemsRepository
{
    constructor(
        @InjectModel(ContestProblemsModel)
        private readonly contestProblemsModel: typeof ContestProblemsModel,
    ) {
        super(contestProblemsModel);
    }
}
