import { ClassStudentsController } from "./controller/class-students.controller";
import { ClassStudentsService } from "./services/class-students.services";
import { ClassStudentsModel } from "./models/class-students.model";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ClassStudentsSqlRepository } from "./repository/class-students-repository.sql";

@Module({
    imports: [SequelizeModule.forFeature([ClassStudentsModel])],
    controllers: [ClassStudentsController],
    providers: [
        ClassStudentsService,
        RepositoryProvider(Entity.CLASS_STUDENTS, ClassStudentsSqlRepository),
    ],
    exports: [ClassStudentsService],
})
export class ClassStudentsModule {}
