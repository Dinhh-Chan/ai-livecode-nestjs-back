import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { TestCaseResults } from "../entities/test-case-results.entity";

export interface TestCaseResultsRepository
    extends BaseRepository<TestCaseResults> {}
