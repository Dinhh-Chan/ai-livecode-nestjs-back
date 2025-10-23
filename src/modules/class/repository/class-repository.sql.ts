import { InjectModel } from "@nestjs/sequelize";
import { ClassModel } from "../models/class.model";
import { Class } from "../entities/class.entity";
import { ClassRepository } from "./class-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";

export class ClassSqlRepository
    extends SqlRepository<Class>
    implements ClassRepository
{
    constructor(
        @InjectModel(ClassModel)
        private readonly classModel: ModelCtor<ClassModel>,
    ) {
        super(classModel);
    }
}
