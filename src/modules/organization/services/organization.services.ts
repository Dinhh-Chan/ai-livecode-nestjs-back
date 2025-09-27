import { BaseService } from "@config/service/base.service";
import { Organization } from "../entities/organization.entity";
import { OrganizationRepository } from "../repository/organization-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";

@Injectable()
export class OrganizationService extends BaseService<
    Organization,
    OrganizationRepository
> {
    constructor(
        @InjectRepository(Entity.ORGANIZATION)
        private readonly organizationRepository: OrganizationRepository
    ) {
        super(organizationRepository);
    }
}
