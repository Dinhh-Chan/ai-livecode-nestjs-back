import { InjectModel } from "@nestjs/sequelize";
import { MessageModel } from "../models/messages.model";
import { Message } from "../entities/messages.entity";
import { MessagesRepository } from "./messages-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class MessagesSqlRepository
    extends SqlRepository<Message>
    implements MessagesRepository
{
    constructor(
        @InjectModel(MessageModel)
        private readonly messageModel: ModelCtor<MessageModel>,
    ) {
        super(messageModel);
    }
}
