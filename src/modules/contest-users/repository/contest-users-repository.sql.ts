import { InjectModel } from "@nestjs/sequelize";
import { ContestUsersModel } from "../models/contest-users.models";
import { ContestUsers } from "../entities/contest-users.entity";
import { ContestUsersRepository } from "./contest-users-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class ContestUsersRepositorySql
    extends SqlRepository<ContestUsers>
    implements ContestUsersRepository
{
    constructor(
        @InjectModel(ContestUsersModel)
        private readonly contestUsersModel: typeof ContestUsersModel,
    ) {
        super(contestUsersModel);
    }
}
