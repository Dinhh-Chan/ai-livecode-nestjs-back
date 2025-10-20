import { InjectModel } from "@nestjs/sequelize";
import { ProblemsModel } from "../models/problems.models";
import { Problems } from "../entities/problems.entity";
import { ProblemsRepository } from "./problems-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { PopulationDto } from "@common/dto/population.dto";

const commonPopulate: PopulationDto<Problems>[] = [
    { path: "topic" },
    { path: "sub_topic" },
    {
        path: "test_cases",
        condition: { is_public: true },
        hasMany: true,
    },
];

export class ProblemsRepositorySql
    extends SqlRepository<Problems>
    implements ProblemsRepository
{
    constructor(
        @InjectModel(ProblemsModel)
        private readonly problemsModel: typeof ProblemsModel,
    ) {
        super(problemsModel, {
            populate: {
                getBatch: commonPopulate,
                getById: commonPopulate,
                getExport: commonPopulate,
                getMany: commonPopulate,
                getOne: commonPopulate,
                getPage: commonPopulate,
            },
        });
    }
}
