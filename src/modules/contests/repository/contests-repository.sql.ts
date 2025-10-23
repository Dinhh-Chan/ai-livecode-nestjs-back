import { InjectModel } from "@nestjs/sequelize";
import { ContestsModel } from "../models/contests.models";
import { Contests } from "../entities/contests.entity";
import { ContestsRepository } from "./contests-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class ContestsRepositorySql
    extends SqlRepository<Contests>
    implements ContestsRepository
{
    constructor(
        @InjectModel(ContestsModel)
        private readonly contestsModel: typeof ContestsModel,
    ) {
        super(contestsModel);
    }
}
