import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TopicMongoRepository } from "./repository/topic-mongo.repository";
import { TopicService } from "./topic.service";
import { TopicController } from "./controller/topic.controller";
import { TopicSchema } from "./entities/topic.entity";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Entity.TOPICS, schema: TopicSchema }])
    ],
    controllers: [TopicController],
    providers: [
        TopicService,
        RepositoryProvider(Entity.TOPICS, TopicMongoRepository),
    ],
    exports: [TopicService]
})
export class TopicModule {}
