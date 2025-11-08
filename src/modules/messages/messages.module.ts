import { MessagesController } from "./controller/messages.controller";
import { MessagesService } from "./services/messages.service";
import { MessageModel } from "./models/messages.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { MessagesSqlRepository } from "./repository/messages-repository.sql";
import { SessionsModule } from "@module/sessions/sessions.module";

@Module({
    imports: [
        SequelizeModule.forFeature([MessageModel]),
        forwardRef(() => SessionsModule),
    ],
    controllers: [MessagesController],
    providers: [
        MessagesService,
        RepositoryProvider(Entity.MESSAGES, MessagesSqlRepository),
    ],
    exports: [MessagesService],
})
export class MessagesModule {}
