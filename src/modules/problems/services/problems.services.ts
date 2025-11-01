import { BaseService } from "@config/service/base.service";
import { Problems } from "../entities/problems.entity";
import { ProblemsRepository } from "../repository/problems-repository.interface";
import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { TestCasesService } from "../../test-cases/services/test-cases.services";
import { CreateTestCasesDto } from "../../test-cases/dto/create-test-cases.dto";
import { CreateTestCasesWithoutProblemIdDto } from "../dto/create-test-cases-without-problem-id.dto";
import { UserProblemProgressService } from "@module/user-problem-progress/services/user-problem-progress.service";
import { UserProblemProgressRepository } from "@module/user-problem-progress/repository/user-problem-progress-repository.interface";

@Injectable()
export class ProblemsService extends BaseService<Problems, ProblemsRepository> {
    private readonly logger = new Logger(ProblemsService.name);

    constructor(
        @InjectRepository(Entity.PROBLEMS)
        private readonly problemsRepository: ProblemsRepository,
        private readonly testCasesService: TestCasesService,
        @Inject(forwardRef(() => UserProblemProgressService))
        private readonly userProblemProgressService: UserProblemProgressService,
        @InjectRepository(Entity.USER_PROBLEM_PROGRESS)
        private readonly userProblemProgressRepository: UserProblemProgressRepository,
    ) {
        super(problemsRepository);
    }

    async getPage(user: User, conditions: any, query: any): Promise<any> {
        const page = await super.getPage(user, conditions, query);
        if (!user?._id || !page?.result?.length) return page;

        const solved = await this.userProblemProgressService.getSolvedProblems(
            user._id,
        );
        const solvedSet = new Set((solved || []).map((p: any) => p.problem_id));
        page.result = page.result.map((p: any) => ({
            ...p,
            is_done: solvedSet.has(p._id),
        }));
        return page;
    }

    async getMany(user: User, conditions: any, query: any): Promise<any[]> {
        const list = await super.getMany(user, conditions, query);
        if (!user?._id || !list?.length) return list;

        const solved = await this.userProblemProgressService.getSolvedProblems(
            user._id,
        );
        const solvedSet = new Set((solved || []).map((p: any) => p.problem_id));
        return list.map((p: any) => ({ ...p, is_done: solvedSet.has(p._id) }));
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
        testCaseDtos: CreateTestCasesWithoutProblemIdDto[],
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

    /**
     * Đếm số lượng problems theo sub_topic_id
     */
    async countProblemsBySubTopic(
        user: User,
        subTopicId: string,
    ): Promise<number> {
        const conditions = { sub_topic_id: subTopicId };
        return this.problemsRepository.count(conditions);
    }

    /**
     * Đếm số lượng problems cho nhiều sub-topics
     */
    async countProblemsBySubTopics(
        user: User,
        subTopicIds: string[],
    ): Promise<{ [subTopicId: string]: number }> {
        const counts: { [subTopicId: string]: number } = {};

        for (const subTopicId of subTopicIds) {
            const count = await this.countProblemsBySubTopic(user, subTopicId);
            counts[subTopicId] = count;
        }

        return counts;
    }

    /**
     * Ghi đè deleteById để xóa UserProblemProgress liên quan trước khi xóa problem
     */
    async deleteById(user: User, id: string, query?: any): Promise<Problems> {
        this.logger.log(`Deleting problem ${id} with related records`);

        // Xóa tất cả UserProblemProgress liên quan đến problem này
        try {
            // Sử dụng repository trực tiếp để xóa records
            const deleteResult =
                await this.userProblemProgressRepository.deleteMany(
                    { problem_id: id } as any,
                    {},
                );
            this.logger.log(
                `Deleted ${deleteResult.deleted || 0} UserProblemProgress records for problem ${id}`,
            );
        } catch (error) {
            this.logger.error(
                `Error deleting UserProblemProgress for problem ${id}: ${error.message}`,
            );
            // Không throw error để tiếp tục xóa problem
        }

        // Gọi super.deleteById để xóa problem
        return super.deleteById(user, id, query);
    }
}
