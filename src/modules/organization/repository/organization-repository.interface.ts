import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Organization } from "../entities/organization.entity";

export interface OrganizationRepository extends BaseRepository<Organization> {}
