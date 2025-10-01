import { InjectModel } from "@nestjs/sequelize";
import { ProblemsModel } from "../models/problems.models";
import { Problems } from "../entities/problems.entity";
import { ProblemsRepository } from "./problems-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class ProblemsRepositorySql
    extends SqlRepository<Problems>
    implements ProblemsRepository
{
    constructor(
        @InjectModel(ProblemsModel)
        private readonly problemsModel: typeof ProblemsModel,
    ) {
        super(problemsModel);
    }
}
