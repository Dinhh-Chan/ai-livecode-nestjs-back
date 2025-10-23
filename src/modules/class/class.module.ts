import { ClassController } from "./controller/class.controller";
import { ClassService } from "./services/class.services";
import { ClassModel } from "./models/class.model";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ClassSqlRepository } from "./repository/class-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([ClassModel])],
    controllers: [ClassController],
    providers: [
        ClassService,
        RepositoryProvider(Entity.CLASSES, ClassSqlRepository),
    ],
    exports: [ClassService],
})
export class ClassModule {}
