import { InjectModel } from "@nestjs/sequelize";
import { TestCaseResultsModel } from "../models/test-case-results.models";
import { TestCaseResults } from "../entities/test-case-results.entity";
import { TestCaseResultsRepository } from "./test-case-results-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class TestCaseResultsRepositorySql
    extends SqlRepository<TestCaseResults>
    implements TestCaseResultsRepository
{
    constructor(
        @InjectModel(TestCaseResultsModel)
        private readonly testCaseResultsModel: typeof TestCaseResultsModel,
    ) {
        super(testCaseResultsModel);
    }
}
