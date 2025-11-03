import { ClassStudentsController } from "./controller/class-students.controller";
import { ClassStudentsService } from "./services/class-students.services";
import { ClassStudentsModel } from "./models/class-students.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { ClassStudentsSqlRepository } from "./repository/class-students-repository.sql";
import { UserModule } from "@module/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([ClassStudentsModel]),
        forwardRef(() => UserModule),
    ],
    controllers: [ClassStudentsController],
    providers: [
        ClassStudentsService,
        RepositoryProvider(Entity.CLASS_STUDENTS, ClassStudentsSqlRepository),
    ],
    exports: [ClassStudentsService],
})
export class ClassStudentsModule {}
