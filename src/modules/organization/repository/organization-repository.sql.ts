import { InjectModel } from "@nestjs/sequelize";
import { OrganizationModel } from "../models/organization.models";
import { Organization } from "../entities/organization.entity";
import { OrganizationRepository } from "./organization-repository.interface";
import { SqlRepository } from "@module/repository/sequelize/sql.repository";

export class OrganizationRepositorySql extends SqlRepository<Organization> implements OrganizationRepository {
    constructor(
        @InjectModel(OrganizationModel)
        private readonly organizationModel: typeof OrganizationModel,
    ) {
        super(organizationModel);
    }
}