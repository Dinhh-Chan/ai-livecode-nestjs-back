import { FeedbackController } from "./controller/feedback.controller";
import { FeedbackService } from "./services/feedback.service";
import { FeedbackModel } from "./models/feedback.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { FeedbackSqlRepository } from "./repository/feedback-repository.sql";
import { UserModule } from "@module/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([FeedbackModel]),
        forwardRef(() => UserModule),
    ],
    controllers: [FeedbackController],
    providers: [
        FeedbackService,
        RepositoryProvider(Entity.FEEDBACK, FeedbackSqlRepository),
    ],
    exports: [FeedbackService],
})
export class FeedbackModule {}
