import { BaseService } from "@config/service/base.service";
import { Problems } from "../entities/problems.entity";
import { ProblemsRepository } from "../repository/problems-repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { TestCasesService } from "../../test-cases/services/test-cases.services";
import { CreateTestCasesDto } from "../../test-cases/dto/create-test-cases.dto";

@Injectable()
export class ProblemsService extends BaseService<Problems, ProblemsRepository> {
    private readonly logger = new Logger(ProblemsService.name);

    constructor(
        @InjectRepository(Entity.PROBLEMS)
        private readonly problemsRepository: ProblemsRepository,
        private readonly testCasesService: TestCasesService,
    ) {
        super(problemsRepository);
    }

    /**
     * Tạo nhiều problems cùng lúc
     */
    async createBulkProblems(
        user: User,
        problemDtos: CreateProblemsDto[],
    ): Promise<Problems[]> {
        this.logger.log(`Creating ${problemDtos.length} problems`);

        const createdProblems: Problems[] = [];

        for (const problemDto of problemDtos) {
            try {
                const problem = await this.create(user, problemDto);
                createdProblems.push(problem);
            } catch (error) {
                this.logger.error(`Error creating problem: ${error.message}`);
                throw error;
            }
        }

        this.logger.log(
            `Created ${createdProblems.length} problems successfully`,
        );
        return createdProblems;
    }

    /**
     * Tạo problem cùng với các test cases
     */
    async createProblemWithTestCases(
        user: User,
        problemDto: CreateProblemsDto,
        testCaseDtos: CreateTestCasesDto[],
    ): Promise<{
        problem: Problems;
        testCases: any[];
    }> {
        this.logger.log(
            `Creating problem with ${testCaseDtos.length} test cases`,
        );

        // Tạo problem trước
        const problem = await this.create(user, problemDto);

        // Cập nhật problem_id trong các test cases
        const testCasesWithProblemId = testCaseDtos.map((testCase) => ({
            ...testCase,
            problem_id: problem._id,
        }));

        // Tạo các test cases
        const createdTestCases = [];
        for (const testCaseDto of testCasesWithProblemId) {
            try {
                const testCase = await this.testCasesService.create(
                    user,
                    testCaseDto,
                );
                createdTestCases.push(testCase);
            } catch (error) {
                this.logger.error(`Error creating test case: ${error.message}`);
                // Không throw error để tiếp tục tạo các test cases khác
            }
        }

        // Cập nhật số lượng test cases trong problem
        await this.updateById(user, problem._id, {
            number_of_tests: createdTestCases.length,
        });

        this.logger.log(
            `Created problem with ${createdTestCases.length} test cases successfully`,
        );
        return {
            problem: {
                ...problem,
                number_of_tests: createdTestCases.length,
            },
            testCases: createdTestCases,
        };
    }
}
