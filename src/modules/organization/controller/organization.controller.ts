import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { OrganizationService } from "../services/organization.services";
import { Organization } from "../entities/organization.entity";
import { CreateOrganizationDto } from "../dto/create-organization.dto";
import { UpdateOrganizationDto } from "../dto/update-oranization.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionOrganizationDto } from "../dto/condition-organization.dto";

@Controller("organization")
@ApiTags("Organization")
export class OrganizationController extends BaseControllerFactory<Organization>(
    Organization,
    ConditionOrganizationDto,
    CreateOrganizationDto,
    UpdateOrganizationDto
) {
    constructor(private readonly organizationService: OrganizationService) {
        super(organizationService);
    }
}