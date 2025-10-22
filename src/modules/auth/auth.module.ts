import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { UserSqlRepository } from "@module/user/repository/user-sql.repository";
import { UserModule } from "@module/user/user.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthPublicController } from "./auth-public.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./common/jwt.strategy";
import { AuthMongoRepository } from "./repository/auth-mongo.repository";

@Module({
    imports: [JwtModule.register({}), UserModule, ScheduleModule.forRoot()],
    providers: [
        AuthService,
        RepositoryProvider(Entity.AUTH, AuthMongoRepository),
        RepositoryProvider(Entity.USER, UserSqlRepository),
        TransactionProvider(SqlTransaction),
        JwtStrategy,
    ],
    controllers: [AuthPublicController, AuthController],
})
export class AuthModule {}
