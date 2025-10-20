import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { TransactionProvider } from "@module/repository/common/transaction";
import { SqlTransaction } from "@module/repository/sequelize/sql.transaction";
import { Module } from "@nestjs/common";
import { CoursesController } from "./controller/courses.controller";
import { CoursesService } from "./services/courses.service";
import { CoursesImportService } from "./services/courses-import.service";
import { CoursesSqlRepository } from "./repository/courses-sql.repository";

@Module({
    controllers: [CoursesController],
    providers: [
        CoursesService,
        RepositoryProvider(Entity.COURSES, CoursesSqlRepository),
        TransactionProvider(SqlTransaction),
    ],
    exports: [CoursesService],
})
export class CoursesModule {}
