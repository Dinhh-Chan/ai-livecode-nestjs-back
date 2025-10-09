import { BaseService } from "@config/service/base.service";
import { TestCaseResults } from "../entities/test-case-results.entity";
import { TestCaseResultsRepository } from "../repository/test-case-results-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class TestCaseResultsService extends BaseService<
    TestCaseResults,
    TestCaseResultsRepository
> {
    constructor(
        @InjectRepository(Entity.TEST_CASE_RESULTS)
        private readonly testCaseResultsRepository: TestCaseResultsRepository,
    ) {
        super(testCaseResultsRepository);
    }
}
