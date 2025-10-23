import { ContestUsersController } from "./controller/contest-users.controller";
import { ContestUsersService } from "./services/contest-users.services";
import { ContestUsersModel } from "./models/contest-users.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContestUsersRepositorySql } from "./repository/contest-users-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([ContestUsersModel])],
    controllers: [ContestUsersController],
    providers: [
        ContestUsersService,
        RepositoryProvider(Entity.CONTEST_USERS, ContestUsersRepositorySql),
    ],
    exports: [ContestUsersService],
})
export class ContestUsersModule {}
