import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CoursesController } from "./controller/courses.controller";
import { CoursesModel } from "./models/courses.model";
import { CoursesService } from "./services/courses.service";
import { CoursesImportService } from "./services/courses-import.service";
import { CoursesSqlRepository } from "./repository/courses-sql.repository";

@Module({
    imports: [SequelizeModule.forFeature([CoursesModel])],
    controllers: [CoursesController],
    providers: [
        CoursesService,
        RepositoryProvider(Entity.COURSES, CoursesSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    exports: [CoursesService],
})
export class CoursesModule {}
