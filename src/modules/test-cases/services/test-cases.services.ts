import { BaseService } from "@config/service/base.service";
import { TestCases } from "../entities/test-cases.entity";
import { TestCasesRepository } from "../repository/test-cases-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class TestCasesService extends BaseService<
    TestCases,
    TestCasesRepository
> {
    constructor(
        @InjectRepository(Entity.TEST_CASES)
        private readonly testCasesRepository: TestCasesRepository
    ) {
        super(testCasesRepository);
    }
}
