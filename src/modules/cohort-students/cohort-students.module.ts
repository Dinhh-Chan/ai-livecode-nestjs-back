import { CohortStudentsController } from "./controller/cohort-students.controller";
import { CohortStudentsService } from "./services/cohort-students.services";
import { CohortStudentsModel } from "./models/cohort-students.model";
import { Module, forwardRef } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { CohortStudentsSqlRepository } from "./repository/cohort-students-repository.sql";
import { UserModule } from "@module/user/user.module";

@Module({
    imports: [
        SequelizeModule.forFeature([CohortStudentsModel]),
        forwardRef(() => UserModule),
    ],
    controllers: [CohortStudentsController],
    providers: [
        CohortStudentsService,
        RepositoryProvider(Entity.COHORT_STUDENTS, CohortStudentsSqlRepository),
    ],
    exports: [CohortStudentsService],
})
export class CohortStudentsModule {}
