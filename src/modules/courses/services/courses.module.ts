import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { Module } from "@nestjs/common";
import { CoursesController } from "../controller/courses.controller";
import { CoursesService } from "./courses.service";
import { CoursesImportService } from "./courses-import.service";
import { CoursesSqlRepository } from "../repository/courses-sql.repository";

@Module({
    controllers: [CoursesController],
    providers: [
        CoursesService,
        CoursesImportService,
        RepositoryProvider(Entity.COURSES, CoursesSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    exports: [CoursesService],
})
export class CoursesModule {}
