import { OrganizationController } from "./controller/organization.controller";
import { OrganizationService } from "./services/organization.services";
import { OrganizationModel } from "./models/organization.models";
import { Module } from "@nestjs/common";
import { Entity } from "@module/repository";
import { RepositoryProvider } from "@module/repository/common/repository";
import { SequelizeModule } from "@nestjs/sequelize";
import { OrganizationRepositorySql } from "./repository/organization-repository.sql";

@Module({
  imports: [
    SequelizeModule.forFeature([OrganizationModel])
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    RepositoryProvider(Entity.ORGANIZATION, OrganizationRepositorySql)
  ],
  exports: [OrganizationService]
})
export class OrganizationModule {}