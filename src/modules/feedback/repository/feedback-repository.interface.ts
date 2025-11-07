import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Feedback } from "../entities/feedback.entity";

export interface FeedbackRepository extends BaseRepository<Feedback> {
    // Các method custom cho Feedback nếu cần
}
