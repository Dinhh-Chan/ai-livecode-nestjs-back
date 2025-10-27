import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { ProblemsRepository } from "@module/problems/repository/problems-repository.interface";

@Injectable()
export class ProblemsCountService {
    private readonly logger = new Logger(ProblemsCountService.name);

    constructor(
        @InjectRepository(Entity.PROBLEMS)
        private readonly problemsRepository: ProblemsRepository,
    ) {}

    /**
     * Đếm tổng số problems trong hệ thống
     */
    async getTotalProblemsCount(): Promise<number> {
        const count = await this.problemsRepository.count({});
        this.logger.log(`Total problems count: ${count}`);
        this.logger.debug(`Query conditions: {}`);
        return count;
    }

    /**
     * Đếm số problems bằng cách dùng getMany và lấy length
     */
    async getTotalProblemsCountAlternative(): Promise<number> {
        this.logger.log("Using alternative method - getMany with length");

        // Không giới hạn kết quả để lấy tất cả
        const allProblems = await this.problemsRepository.getMany({}, {});
        const count = allProblems.length;

        this.logger.log(`Alternative count result: ${count}`);
        this.logger.debug(
            `Retrieved ${allProblems.length} problems from database`,
        );

        return count;
    }

    /**
     * Đếm bằng cách dùng getPage với limit lớn
     */
    async getTotalProblemsCountWithPage(): Promise<number> {
        this.logger.log("Using page method to count");

        // Dùng getPage với limit lớn để lấy total
        const pageResult = await this.problemsRepository.getPage(
            {},
            {
                page: 1,
                limit: 1, // Chỉ cần lấy 1 record để biết total
            },
        );

        this.logger.log(
            `Page count result: total=${pageResult.total}, result=${pageResult.result.length}`,
        );

        return pageResult.total;
    }

    /**
     * Đếm số problems theo điều kiện
     */
    async getProblemsCountByCondition(conditions: any): Promise<number> {
        return this.problemsRepository.count(conditions);
    }

    /**
     * Đếm số problems theo độ khó
     */
    async getProblemsCountByDifficulty(difficulty: number): Promise<number> {
        return this.problemsRepository.count({ difficulty });
    }

    /**
     * Đếm số problems theo topic
     */
    async getProblemsCountByTopic(topicId: string): Promise<number> {
        return this.problemsRepository.count({ topic_id: topicId });
    }

    /**
     * Đếm số problems theo sub-topic
     */
    async getProblemsCountBySubTopic(subTopicId: string): Promise<number> {
        return this.problemsRepository.count({ sub_topic_id: subTopicId });
    }

    /**
     * Đếm số problems công khai
     */
    async getPublicProblemsCount(): Promise<number> {
        return this.problemsRepository.count({ is_public: true });
    }

    /**
     * Đếm số problems đang hoạt động
     */
    async getActiveProblemsCount(): Promise<number> {
        return this.problemsRepository.count({ is_active: true });
    }
}
