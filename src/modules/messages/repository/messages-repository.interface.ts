import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Message } from "../entities/messages.entity";

export interface MessagesRepository extends BaseRepository<Message> {
    // Các method custom cho Message nếu cần
}
