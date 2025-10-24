import { BaseService } from "@config/service/base.service";
import { TestCases } from "../entities/test-cases.entity";
import { TestCasesRepository } from "../repository/test-cases-repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { CreateTestCasesDto } from "../dto/create-test-cases.dto";

@Injectable()
export class TestCasesService extends BaseService<
    TestCases,
    TestCasesRepository
> {
    private readonly logger = new Logger(TestCasesService.name);

    constructor(
        @InjectRepository(Entity.TEST_CASES)
        private readonly testCasesRepository: TestCasesRepository,
    ) {
        super(testCasesRepository);
    }

    /**
     * Tạo nhiều test cases cùng lúc
     */
    async createBulkTestCases(
        user: User,
        testCaseDtos: CreateTestCasesDto[],
    ): Promise<TestCases[]> {
        this.logger.log(`Creating ${testCaseDtos.length} test cases`);

        const createdTestCases: TestCases[] = [];

        for (const testCaseDto of testCaseDtos) {
            try {
                const testCase = await this.create(user, testCaseDto);
                createdTestCases.push(testCase);
            } catch (error) {
                this.logger.error(`Error creating test case: ${error.message}`);
                throw error;
            }
        }

        this.logger.log(
            `Created ${createdTestCases.length} test cases successfully`,
        );
        return createdTestCases;
    }
}
