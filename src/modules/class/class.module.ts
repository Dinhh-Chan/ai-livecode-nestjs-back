import { ClassController } from "./controller/class.controller";
import { ClassService } from "./services/class.services";
import { ClassModel } from "./models/class.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserModule } from "@module/user/user.module";
import { ClassSqlRepository } from "./repository/class-repository.sql";
import { ClassStudentsModule } from "@module/class-students/class-students.module";
import { StudentSubmissionsModule } from "@module/student-submissions/student-submissions.module";
import { ProblemsModule } from "@module/problems/problems.module";
import { TopicsModule } from "@module/topics/topics.module";

@Module({
    imports: [
        SequelizeModule.forFeature([ClassModel]),
        forwardRef(() => UserModule),
        forwardRef(() => ClassStudentsModule),
        forwardRef(() => StudentSubmissionsModule),
        forwardRef(() => ProblemsModule),
        forwardRef(() => TopicsModule),
    ],
    controllers: [ClassController],
    providers: [
        ClassService,
        RepositoryProvider(Entity.CLASSES, ClassSqlRepository),
    ],
    exports: [ClassService],
})
export class ClassModule {}
