import { BaseImportService } from "@config/service/base-import.service";
import { Entity } from "@module/repository";
import { BaseTransaction } from "@module/repository/common/base-transaction.interface";
import { InjectRepository } from "@module/repository/common/repository";
import { InjectTransaction } from "@module/repository/common/transaction";
import { Injectable } from "@nestjs/common";
import { Courses } from "../entities/courses.entity";
import { CoursesRepository } from "../repository/courses-repository.interface";

@Injectable()
export class CoursesImportService extends BaseImportService<
    Courses,
    CoursesRepository
> {
    constructor(
        @InjectRepository(Entity.COURSES)
        private readonly coursesRepository: CoursesRepository,
        @InjectTransaction()
        private readonly coursesTransaction: BaseTransaction,
    ) {
        super(coursesRepository, {
            transaction: coursesTransaction,
        });
    }
}
