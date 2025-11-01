import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ContestSubmissions } from "../entities/contest-submissions.entity";

export interface ContestSubmissionsRepository
    extends BaseRepository<ContestSubmissions> {
    // Các method custom cho ContestSubmissions nếu cần
}
