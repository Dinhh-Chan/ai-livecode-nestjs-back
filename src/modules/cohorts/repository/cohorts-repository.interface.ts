import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Cohort } from "../entities/cohorts.entity";

export interface CohortsRepository extends BaseRepository<Cohort> {
    /**
     * Tìm khóa học theo mã
     * @param code Mã khóa học
     */
    findByCode(code: string): Promise<Cohort | null>;

    /**
     * Lấy danh sách khóa học đang hoạt động
     */
    getActiveCohorts(): Promise<Cohort[]>;

    /**
     * Lấy danh sách khóa học theo khoảng thời gian
     * @param startDate Thời gian bắt đầu
     * @param endDate Thời gian kết thúc
     */
    getCohortsByTimeRange(startDate: Date, endDate: Date): Promise<Cohort[]>;
}
