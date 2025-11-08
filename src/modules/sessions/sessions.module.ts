import { SessionsController } from "./controller/sessions.controller";
import { SessionsService } from "./services/sessions.service";
import { SessionModel } from "./models/sessions.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { SessionsSqlRepository } from "./repository/sessions-repository.sql";
import { UserModule } from "@module/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([SessionModel]),
        forwardRef(() => UserModule),
    ],
    controllers: [SessionsController],
    providers: [
        SessionsService,
        RepositoryProvider(Entity.SESSIONS, SessionsSqlRepository),
    ],
    exports: [SessionsService],
})
export class SessionsModule {}
