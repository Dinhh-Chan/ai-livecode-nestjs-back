import { InjectModel } from "@nestjs/sequelize";
import { ClassStudentsModel } from "../models/class-students.model";
import { ClassStudents } from "../entities/class-students.entity";
import { ClassStudentsRepository } from "./class-students-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class ClassStudentsSqlRepository
    extends SqlRepository<ClassStudents>
    implements ClassStudentsRepository
{
    constructor(
        @InjectModel(ClassStudentsModel)
        private readonly classStudentsModel: ModelCtor<ClassStudentsModel>,
    ) {
        super(classStudentsModel);
    }
}
