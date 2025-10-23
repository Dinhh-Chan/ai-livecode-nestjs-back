import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ClassStudents } from "../entities/class-students.entity";

export interface ClassStudentsRepository extends BaseRepository<ClassStudents> {
    // Các method custom cho ClassStudents nếu cần
}
