import { PartialType } from "@nestjs/mapped-types";
import { Organization } from "../entities/organization.entity";
export class ConditionOrganizationDto extends PartialType(Organization) {}
