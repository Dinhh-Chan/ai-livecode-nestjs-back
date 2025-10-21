import { InjectModel } from "@nestjs/sequelize";
import { TestCasesModel } from "../models/test-cases.models";
import { TestCases } from "../entities/test-cases.entity";
import { TestCasesRepository } from "./test-cases-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class TestCasesRepositorySql
    extends SqlRepository<TestCases>
    implements TestCasesRepository
{
    constructor(
        @InjectModel(TestCasesModel)
        private readonly testCasesModel: typeof TestCasesModel,
    ) {
        super(testCasesModel);
    }
}
