import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Session } from "../entities/sessions.entity";

export interface SessionsRepository extends BaseRepository<Session> {
    // Các method custom cho Session nếu cần
}
