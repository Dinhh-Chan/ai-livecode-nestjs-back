import { InjectModel } from "@nestjs/sequelize";
import { CohortModel } from "../models/cohorts.models";
import { Cohort } from "../entities/cohorts.entity";
import { CohortsRepository } from "./cohorts-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";
import { ModelCtor } from "sequelize-typescript";
import { Op } from "sequelize";

export class CohortsSqlRepository
    extends SqlRepository<Cohort>
    implements CohortsRepository
{
    constructor(
        @InjectModel(CohortModel)
        private readonly cohortModel: ModelCtor<CohortModel>,
    ) {
        super(cohortModel);
    }

    async findByCode(code: string): Promise<Cohort | null> {
        return this.getOne({ code }, {});
    }

    async getActiveCohorts(): Promise<Cohort[]> {
        return this.getMany({ is_active: true }, {});
    }

    async getCohortsByTimeRange(
        startDate: Date,
        endDate: Date,
    ): Promise<Cohort[]> {
        return this.getMany(
            {
                start_time: { [Op.lte]: endDate },
                end_time: { [Op.gte]: startDate },
            } as any,
            {},
        );
    }
}
