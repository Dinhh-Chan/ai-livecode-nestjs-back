import { InjectModel } from "@nestjs/sequelize";
import { CohortStudentsModel } from "../models/cohort-students.model";
import { CohortStudents } from "../entities/cohort-students.entity";
import { CohortStudentsRepository } from "./cohort-students-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class CohortStudentsSqlRepository
    extends SqlRepository<CohortStudents>
    implements CohortStudentsRepository
{
    constructor(
        @InjectModel(CohortStudentsModel)
        private readonly cohortStudentsModel: ModelCtor<CohortStudentsModel>,
    ) {
        super(cohortStudentsModel);
    }
}
