import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { IsString, IsOptional, IsBoolean, IsEmail } from "class-validator";

export class Organization implements BaseEntity {
    @StrObjectId()
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "Mã tổ chức", required: true })
    organId: string;

    @IsString()
    @EntityDefinition.field({ label: "SS ID", required: true })
    ssId: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Tổ chức phụ trách" })
    organizationInCharge?: string;

    @IsString()
    @EntityDefinition.field({ label: "Tên tổ chức", required: true })
    organName: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Địa chỉ tổ chức" })
    organAdd?: string;

    @IsEmail()
    @IsOptional()
    @EntityDefinition.field({ label: "Email" })
    email?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Số điện thoại" })
    telephone?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Số fax" })
    fax?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Website" })
    website?: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Tổ chức bên ngoài" })
    isExternal?: boolean;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả" })
    description?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái" })
    status?: string;
}