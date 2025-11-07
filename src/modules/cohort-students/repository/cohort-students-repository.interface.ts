import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { CohortStudents } from "../entities/cohort-students.entity";

export interface CohortStudentsRepository
    extends BaseRepository<CohortStudents> {
    // Các method custom cho CohortStudents nếu cần
}
